<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SupplierConnector;
use App\Models\SupplierOffer;
use App\Models\User;
use App\Services\Connectors\SupplierConnectorManager;
use App\Services\SupplierCatalogImportService;
use App\Services\SupplierSelectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SupplierOfferController extends Controller
{
    public function __construct(
        protected SupplierSelectionService $selectionService,
        protected SupplierCatalogImportService $importService,
        protected SupplierConnectorManager $connectorManager
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'supplier_id' => ['required', 'exists:users,id'],
            'supplier_sku' => ['nullable', 'string', 'max:100'],
            'purchase_price' => ['required', 'numeric', 'min:0.01'],
            'currency_code' => ['nullable', 'string', 'max:10'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'preparation_days' => ['required', 'integer', 'min:0', 'max:90'],
            'delivery_days' => ['required', 'integer', 'min:1', 'max:120'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'commercial_discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'commercial_terms' => ['nullable', 'string', 'max:255'],
            'reliability_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        SupplierOffer::updateOrCreate(
            [
                'product_id' => $validated['product_id'],
                'supplier_id' => $validated['supplier_id'],
            ],
            [
                'supplier_sku' => $validated['supplier_sku'] ?? null,
                'purchase_price' => $validated['purchase_price'],
                'currency_code' => strtoupper($validated['currency_code'] ?? 'AED'),
                'stock_quantity' => $validated['stock_quantity'],
                'preparation_days' => $validated['preparation_days'],
                'delivery_days' => $validated['delivery_days'],
                'shipping_cost' => $validated['shipping_cost'] ?? 0,
                'commercial_discount_percent' => $validated['commercial_discount_percent'] ?? 0,
                'commercial_terms' => $validated['commercial_terms'] ?? null,
                'reliability_score' => $validated['reliability_score'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'last_synced_at' => now(),
            ]
        );

        $product = Product::findOrFail($validated['product_id']);
        $this->selectionService->selectBestOfferForProduct($product, true);

        return back()->with('success', 'Supplier offer saved and comparison scores recalculated.');
    }

    public function destroy(SupplierOffer $offer): RedirectResponse
    {
        $product = $offer->product;
        $offer->delete();

        if ($product) {
            $this->selectionService->selectBestOfferForProduct($product, true);
        }

        return back()->with('success', 'Supplier offer deleted.');
    }

    public function saveRules(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'weight_price' => ['required', 'integer', 'min:0', 'max:100'],
            'weight_stock' => ['required', 'integer', 'min:0', 'max:100'],
            'weight_delivery' => ['required', 'integer', 'min:0', 'max:100'],
            'weight_shipping' => ['required', 'integer', 'min:0', 'max:100'],
            'weight_reliability' => ['required', 'integer', 'min:0', 'max:100'],
            'weight_commercial' => ['required', 'integer', 'min:0', 'max:100'],
            'min_margin_percent' => ['required', 'numeric', 'min:0', 'max:95'],
            'require_in_stock' => ['boolean'],
        ]);

        $this->selectionService->saveRules($validated);
        $updated = $this->selectionService->recalculateAll();

        return back()->with('success', "Auto-selection rules saved and applied to {$updated} product(s).");
    }

    public function override(Product $product, SupplierOffer $offer): RedirectResponse
    {
        if ((int) $offer->product_id !== (int) $product->id) {
            return back()->withErrors(['offer' => 'Selected offer does not belong to this product.']);
        }

        $this->selectionService->overrideOffer($product, $offer);

        return back()->with('success', "Manually selected supplier offer for '{$product->name}'.");
    }

    public function clearOverride(Product $product): RedirectResponse
    {
        $this->selectionService->clearOverride($product);

        return back()->with('success', "Reset '{$product->name}' to automatic supplier selection.");
    }

    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'exists:users,id'],
            'catalog_file' => ['required', 'file', 'max:10240'],
            'create_missing_products' => ['boolean'],
        ]);

        $supplier = User::findOrFail($validated['supplier_id']);

        try {
            $log = $this->importService->importFile(
                supplier: $supplier,
                file: $request->file('catalog_file'),
                initiator: $request->user(),
                createMissingProducts: (bool) ($validated['create_missing_products'] ?? false)
            );

            return back()->with(
                'success',
                "Catalog import finished ({$log->source_type}): {$log->imported_rows} new, {$log->updated_rows} updated, {$log->failed_rows} failed."
            );
        } catch (\Throwable $e) {
            return back()->withErrors(['catalog_file' => 'Import failed: ' . $e->getMessage()]);
        }
    }

    public function downloadTemplate(string $format): Response
    {
        $products = Product::where('status', 'published')->take(5)->get();

        if (strtolower($format) === 'xml') {
            $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<offers>\n";
            foreach ($products as $p) {
                $price = number_format(round((float) $p->base_price * 0.65, 2), 2, '.', '');
                $xml .= "  <offer>\n";
                $xml .= '    <sku>' . htmlspecialchars((string) $p->sku) . "</sku>\n";
                $xml .= '    <part_number>' . htmlspecialchars((string) $p->part_number) . "</part_number>\n";
                $xml .= "    <purchase_price>{$price}</purchase_price>\n";
                $xml .= "    <stock_quantity>30</stock_quantity>\n";
                $xml .= "    <preparation_days>1</preparation_days>\n";
                $xml .= "    <delivery_days>2</delivery_days>\n";
                $xml .= "    <shipping_cost>25.00</shipping_cost>\n";
                $xml .= "    <commercial_discount_percent>5</commercial_discount_percent>\n";
                $xml .= "  </offer>\n";
            }
            $xml .= "</offers>\n";

            return response($xml, 200, [
                'Content-Type' => 'application/xml',
                'Content-Disposition' => 'attachment; filename="supplier-catalog-template.xml"',
            ]);
        }

        $lines = ['sku,part_number,purchase_price,stock_quantity,preparation_days,delivery_days,shipping_cost,commercial_discount_percent,commercial_terms'];
        foreach ($products as $p) {
            $price = number_format(round((float) $p->base_price * 0.65, 2), 2, '.', '');
            $lines[] = implode(',', [
                $p->sku,
                $p->part_number,
                $price,
                '30',
                '1',
                '2',
                '25.00',
                '5',
                'Net 30',
            ]);
        }

        return response(implode("\n", $lines) . "\n", 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="supplier-catalog-template.csv"',
        ]);
    }

    public function storeConnector(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'exists:users,id'],
            'name' => ['required', 'string', 'max:150'],
            'driver' => ['required', 'in:rest_json,xml_feed,mock_b2b'],
            'endpoint_url' => ['nullable', 'url', 'max:500'],
            'auth_type' => ['required', 'in:none,api_key,bearer,basic'],
            'api_key' => ['nullable', 'string', 'max:500'],
            'header_name' => ['nullable', 'string', 'max:100'],
            'token' => ['nullable', 'string', 'max:500'],
            'username' => ['nullable', 'string', 'max:150'],
            'password' => ['nullable', 'string', 'max:150'],
            'sync_frequency' => ['required', 'in:manual,hourly,daily'],
            'is_active' => ['boolean'],
        ]);

        $creds = array_filter([
            'api_key' => $validated['api_key'] ?? null,
            'header_name' => $validated['header_name'] ?? null,
            'token' => $validated['token'] ?? null,
            'username' => $validated['username'] ?? null,
            'password' => $validated['password'] ?? null,
        ], fn ($v) => $v !== null && $v !== '');

        SupplierConnector::create([
            'supplier_id' => $validated['supplier_id'],
            'name' => $validated['name'],
            'driver' => $validated['driver'],
            'endpoint_url' => $validated['endpoint_url'] ?? null,
            'auth_type' => $validated['auth_type'],
            'credentials_json' => empty($creds) ? null : json_encode($creds),
            'sync_frequency' => $validated['sync_frequency'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', "Connector '{$validated['name']}' created.");
    }

    public function destroyConnector(SupplierConnector $connector): RedirectResponse
    {
        $connector->delete();

        return back()->with('success', 'Supplier connector deleted.');
    }

    public function testConnector(SupplierConnector $connector): RedirectResponse
    {
        $result = $this->connectorManager->test($connector);

        if ($result['ok']) {
            return back()->with('success', $result['message']);
        }

        return back()->withErrors(['connector' => 'Connection test failed: ' . $result['message']]);
    }

    public function syncConnector(Request $request, SupplierConnector $connector): RedirectResponse
    {
        try {
            $log = $this->connectorManager->sync($connector, $request->user());

            return back()->with(
                'success',
                "Connector '{$connector->name}' synced: {$log->imported_rows} new, {$log->updated_rows} updated."
            );
        } catch (\Throwable $e) {
            return back()->withErrors(['connector' => 'Sync failed: ' . $e->getMessage()]);
        }
    }
}
