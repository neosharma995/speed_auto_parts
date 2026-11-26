<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;
use App\Models\SupplierImportLog;
use App\Models\SupplierOffer;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use RuntimeException;
use ZipArchive;

class SupplierCatalogImportService
{
    public function __construct(
        protected SupplierSelectionService $selectionService
    ) {}

    /**
     * Import a supplier catalog file (CSV, XML, or Excel .xlsx) into supplier offers.
     */
    public function importFile(
        User $supplier,
        UploadedFile $file,
        ?User $initiator = null,
        bool $createMissingProducts = false
    ): SupplierImportLog {
        $ext = strtolower($file->getClientOriginalExtension());
        $path = $file->getRealPath();

        if (! $path || ! is_file($path)) {
            throw new RuntimeException('Uploaded file could not be read.');
        }

        $rows = match ($ext) {
            'csv', 'txt' => $this->parseCsv($path),
            'xml' => $this->parseXml($path),
            'xlsx' => $this->parseXlsx($path),
            default => throw new RuntimeException("Unsupported file format '.{$ext}'. Please upload CSV, XML, or XLSX."),
        };

        return $this->processRows(
            supplier: $supplier,
            rows: $rows,
            sourceType: $ext === 'txt' ? 'csv' : $ext,
            filename: $file->getClientOriginalName(),
            initiator: $initiator,
            createMissingProducts: $createMissingProducts
        );
    }

    /**
     * Upsert normalized offer rows for a supplier and recalculate best offers.
     *
     * @param  array<int, array<string, mixed>>  $rows
     */
    public function processRows(
        User $supplier,
        array $rows,
        string $sourceType,
        ?string $filename = null,
        ?User $initiator = null,
        bool $createMissingProducts = false,
        ?int $connectorId = null
    ): SupplierImportLog {
        $imported = 0;
        $updated = 0;
        $failed = 0;
        $errors = [];
        $touchedProductIds = [];

        $profile = $supplier->supplierProfile;

        foreach ($rows as $idx => $rawRow) {
            $rowNum = $idx + 1;
            $row = $this->normalizeKeys($rawRow);

            $sku = trim((string) ($row['sku'] ?? $row['product_sku'] ?? ''));
            $partNumber = trim((string) ($row['part_number'] ?? $row['part_no'] ?? $row['oem'] ?? ''));
            $price = (float) ($row['purchase_price'] ?? $row['price'] ?? $row['cost'] ?? 0);

            if ($sku === '' && $partNumber === '') {
                $failed++;
                $errors[] = "Row {$rowNum}: Missing SKU or part_number.";
                continue;
            }

            if ($price <= 0) {
                $failed++;
                $errors[] = "Row {$rowNum} ({$sku}): Invalid purchase price.";
                continue;
            }

            $product = Product::query()
                ->when($sku !== '', fn ($q) => $q->where('sku', $sku))
                ->when($sku === '' && $partNumber !== '', fn ($q) => $q->where('part_number', $partNumber))
                ->first();

            if (! $product && $partNumber !== '') {
                $product = Product::where('part_number', $partNumber)->first();
            }

            if (! $product) {
                if (! $createMissingProducts) {
                    $failed++;
                    $errors[] = "Row {$rowNum} ({$sku}): No matching catalog product found.";
                    continue;
                }

                $name = trim((string) ($row['name'] ?? $row['product_name'] ?? "Imported Part {$sku}"));
                $sellingPrice = (float) ($row['selling_price'] ?? $row['base_price'] ?? round($price * 1.35, 2));

                $product = Product::create([
                    'supplier_id' => $supplier->id,
                    'name' => $name,
                    'slug' => Str::slug($name . '-' . Str::random(5)),
                    'sku' => $sku !== '' ? $sku : ('IMP-' . strtoupper(Str::random(6))),
                    'part_number' => $partNumber !== '' ? $partNumber : ($sku !== '' ? $sku : 'IMP-' . random_int(1000, 9999)),
                    'base_price' => $sellingPrice,
                    'cost_price' => $price,
                    'supplier_price' => $price,
                    'stock_quantity' => 0,
                    'supplier_stock' => max(0, (int) ($row['stock_quantity'] ?? $row['stock'] ?? $row['qty'] ?? 0)),
                    'stock_status' => 'out_of_stock',
                    'status' => 'draft',
                ]);
            }

            $existing = SupplierOffer::where('product_id', $product->id)
                ->where('supplier_id', $supplier->id)
                ->first();

            $payload = [
                'supplier_sku' => trim((string) ($row['supplier_sku'] ?? $sku ?: $product->sku)),
                'purchase_price' => $price,
                'currency_code' => strtoupper(trim((string) ($row['currency'] ?? $row['currency_code'] ?? $profile?->currency_code ?? 'AED'))),
                'stock_quantity' => max(0, (int) ($row['stock_quantity'] ?? $row['stock'] ?? $row['qty'] ?? 0)),
                'preparation_days' => max(0, (int) ($row['preparation_days'] ?? $row['prep_days'] ?? 1)),
                'delivery_days' => max(1, (int) ($row['delivery_days'] ?? $row['lead_time_days'] ?? $profile?->lead_time_days ?? 3)),
                'shipping_cost' => max(0, (float) ($row['shipping_cost'] ?? $row['shipping'] ?? $profile?->default_shipping_cost ?? 0)),
                'commercial_discount_percent' => max(0, min(100, (float) ($row['commercial_discount_percent'] ?? $row['discount_percent'] ?? $profile?->default_discount_percent ?? 0))),
                'commercial_terms' => trim((string) ($row['commercial_terms'] ?? $profile?->payment_terms ?? 'Net 30')),
                'reliability_score' => isset($row['reliability_score']) && $row['reliability_score'] !== ''
                    ? max(0, min(100, (float) $row['reliability_score']))
                    : ($profile?->reliability_score ?? 85.0),
                'is_active' => true,
                'last_synced_at' => now(),
            ];

            if ($existing) {
                $existing->update($payload);
                $updated++;
            } else {
                SupplierOffer::create([
                    'product_id' => $product->id,
                    'supplier_id' => $supplier->id,
                    ...$payload,
                ]);
                $imported++;
            }

            $touchedProductIds[$product->id] = $product->id;
        }

        // Recalculate auto-selection for all updated products
        foreach (Product::whereIn('id', array_values($touchedProductIds))->get() as $product) {
            $this->selectionService->selectBestOfferForProduct($product, true);
        }

        return SupplierImportLog::create([
            'supplier_id' => $supplier->id,
            'connector_id' => $connectorId,
            'source_type' => $sourceType,
            'filename' => $filename,
            'total_rows' => count($rows),
            'imported_rows' => $imported,
            'updated_rows' => $updated,
            'failed_rows' => $failed,
            'status' => $failed > 0 && ($imported + $updated) === 0 ? 'failed' : 'completed',
            'error_summary' => empty($errors) ? null : implode("\n", array_slice($errors, 0, 20)),
            'initiated_by' => $initiator?->id,
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function parseCsv(string $path): array
    {
        $handle = fopen($path, 'rb');
        if (! $handle) {
            throw new RuntimeException('Unable to open CSV file.');
        }

        $headers = null;
        $rows = [];

        while (($data = fgetcsv($handle)) !== false) {
            if ($data === [null] || count(array_filter($data, fn ($v) => trim((string) $v) !== '')) === 0) {
                continue;
            }

            if ($headers === null) {
                $headers = array_map(
                    fn ($h) => strtolower(trim(preg_replace('/^\xEF\xBB\xBF/', '', (string) $h))),
                    $data
                );
                continue;
            }

            $assoc = [];
            foreach ($headers as $i => $key) {
                $assoc[$key] = $data[$i] ?? '';
            }
            $rows[] = $assoc;
        }

        fclose($handle);

        return $rows;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function parseXml(string $path): array
    {
        $content = file_get_contents($path);
        if ($content === false || trim($content) === '') {
            throw new RuntimeException('XML file is empty.');
        }

        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($content);
        if ($xml === false) {
            throw new RuntimeException('Invalid XML format.');
        }

        $rows = [];
        $candidates = $xml->xpath('//item | //product | //offer | //row');
        if (empty($candidates)) {
            $candidates = [];
            foreach ($xml->children() as $child) {
                $candidates[] = $child;
            }
        }

        foreach ($candidates as $node) {
            $row = [];
            foreach ($node->children() as $field => $val) {
                $row[strtolower((string) $field)] = trim((string) $val);
            }
            if (! empty($row)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }

    /**
     * Native Excel (.xlsx) parser using PHP ZipArchive + SimpleXML (no external library required).
     *
     * @return array<int, array<string, mixed>>
     */
    public function parseXlsx(string $path): array
    {
        $zip = new ZipArchive();
        if ($zip->open($path) !== true) {
            throw new RuntimeException('Unable to open Excel (.xlsx) archive.');
        }

        $sharedStrings = [];
        $sharedXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($sharedXml !== false) {
            $ss = @simplexml_load_string($sharedXml);
            if ($ss !== false) {
                foreach ($ss->si as $si) {
                    if (isset($si->t)) {
                        $sharedStrings[] = (string) $si->t;
                    } else {
                        $text = '';
                        foreach ($si->r as $run) {
                            $text .= (string) $run->t;
                        }
                        $sharedStrings[] = $text;
                    }
                }
            }
        }

        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();

        if ($sheetXml === false) {
            throw new RuntimeException('Excel workbook does not contain sheet1.xml.');
        }

        $sheet = @simplexml_load_string($sheetXml);
        if ($sheet === false || ! isset($sheet->sheetData)) {
            throw new RuntimeException('Invalid Excel worksheet XML.');
        }

        $rawMatrix = [];
        foreach ($sheet->sheetData->row as $rowNode) {
            $cells = [];
            foreach ($rowNode->c as $c) {
                $ref = (string) $c['r'];
                $colLetters = preg_replace('/\d+/', '', $ref);
                $colIndex = $this->columnLettersToIndex($colLetters);
                $type = (string) $c['t'];

                if ($type === 's') {
                    $val = $sharedStrings[(int) $c->v] ?? '';
                } elseif ($type === 'inlineStr') {
                    $val = (string) ($c->is->t ?? '');
                } else {
                    $val = (string) ($c->v ?? '');
                }

                $cells[$colIndex] = trim($val);
            }

            if (! empty($cells)) {
                $maxCol = max(array_keys($cells));
                $ordered = [];
                for ($i = 0; $i <= $maxCol; $i++) {
                    $ordered[] = $cells[$i] ?? '';
                }
                $rawMatrix[] = $ordered;
            }
        }

        if (count($rawMatrix) < 2) {
            return [];
        }

        $headers = array_map(fn ($h) => strtolower(trim((string) $h)), array_shift($rawMatrix));
        $rows = [];
        foreach ($rawMatrix as $vals) {
            $assoc = [];
            foreach ($headers as $i => $key) {
                if ($key !== '') {
                    $assoc[$key] = $vals[$i] ?? '';
                }
            }
            if (count(array_filter($assoc, fn ($v) => trim((string) $v) !== '')) > 0) {
                $rows[] = $assoc;
            }
        }

        return $rows;
    }

    private function columnLettersToIndex(string $letters): int
    {
        $letters = strtoupper($letters);
        $index = 0;
        for ($i = 0; $i < strlen($letters); $i++) {
            $index = ($index * 26) + (ord($letters[$i]) - ord('A') + 1);
        }

        return max(0, $index - 1);
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function normalizeKeys(array $row): array
    {
        $normalized = [];
        foreach ($row as $k => $v) {
            $cleanKey = strtolower(trim(str_replace([' ', '-'], '_', (string) $k)));
            $normalized[$cleanKey] = $v;
        }

        return $normalized;
    }
}
