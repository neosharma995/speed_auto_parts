<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StockTransferService
{
    /**
     * Supplier dispatches a lot of one or more products to the Admin Warehouse (pending receipt).
     *
     * @param  array<int, array{product_id: int|string, quantity: int|string, unit_price?: float|int|string|null}>  $items
     * @return array<int, StockTransfer>
     */
    public function sendLotToWarehouse(User $supplier, array $items, ?string $notes = null): array
    {
        return DB::transaction(function () use ($supplier, $items, $notes) {
            $lotNumber = 'LOT-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
            $transfers = [];

            foreach ($items as $index => $item) {
                $productId = (int) ($item['product_id'] ?? 0);
                $quantity = (int) ($item['quantity'] ?? 0);
                $unitPrice = isset($item['unit_price']) && $item['unit_price'] !== '' ? (float) $item['unit_price'] : null;

                $product = Product::lockForUpdate()->find($productId);

                if (! $product || (int) $product->supplier_id !== (int) $supplier->id) {
                    throw ValidationException::withMessages([
                        "items.{$index}.product_id" => 'Selected product does not belong to your supplier account.',
                    ]);
                }

                if ($quantity < 1) {
                    throw ValidationException::withMessages([
                        "items.{$index}.quantity" => 'Lot quantity must be at least 1 unit.',
                    ]);
                }

                if ($product->supplier_stock < $quantity) {
                    throw ValidationException::withMessages([
                        "items.{$index}.quantity" => "Insufficient supplier stock for {$product->name}. Available: {$product->supplier_stock} units.",
                    ]);
                }

                $product->supplier_stock -= $quantity;

                if ($unitPrice !== null && $unitPrice > 0) {
                    $product->supplier_price = $unitPrice;
                    $product->cost_price = $unitPrice;
                }

                $product->save();

                $transfers[] = StockTransfer::create([
                    'lot_number' => $lotNumber,
                    'product_id' => $product->id,
                    'supplier_id' => $supplier->id,
                    'initiated_by' => $supplier->id,
                    'direction' => 'supplier_to_warehouse',
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice ?? $product->supplier_price ?? $product->cost_price,
                    'status' => 'pending',
                    'notes' => $notes,
                ]);
            }

            return $transfers;
        });
    }

    /**
     * Admin receives a pending supplier lot into the Admin Warehouse.
     */
    public function receiveLotInWarehouse(StockTransfer $transfer, User $admin): StockTransfer
    {
        return DB::transaction(function () use ($transfer, $admin) {
            $lockedTransfer = StockTransfer::lockForUpdate()->findOrFail($transfer->id);

            if ($lockedTransfer->direction !== 'supplier_to_warehouse' || $lockedTransfer->status !== 'pending') {
                throw ValidationException::withMessages([
                    'transfer' => 'Only pending supplier lots can be received into the warehouse.',
                ]);
            }

            $product = Product::lockForUpdate()->findOrFail($lockedTransfer->product_id);
            $product->warehouse_stock += $lockedTransfer->quantity;

            if ($lockedTransfer->unit_price !== null) {
                $product->supplier_price = $lockedTransfer->unit_price;
                $product->cost_price = $lockedTransfer->unit_price;
            }

            $product->save();

            $lockedTransfer->update([
                'status' => 'received',
                'approved_by' => $admin->id,
                'received_at' => now(),
            ]);

            return $lockedTransfer->fresh(['product', 'supplier', 'approver']);
        });
    }

    /**
     * Admin rejects a pending supplier lot and returns its units back to supplier_stock.
     */
    public function rejectLotFromWarehouse(StockTransfer $transfer, User $admin, ?string $reason = null): StockTransfer
    {
        return DB::transaction(function () use ($transfer, $admin, $reason) {
            $lockedTransfer = StockTransfer::lockForUpdate()->findOrFail($transfer->id);

            if ($lockedTransfer->direction !== 'supplier_to_warehouse' || $lockedTransfer->status !== 'pending') {
                throw ValidationException::withMessages([
                    'transfer' => 'Only pending supplier lots can be rejected.',
                ]);
            }

            $product = Product::lockForUpdate()->findOrFail($lockedTransfer->product_id);
            $product->supplier_stock += $lockedTransfer->quantity;
            $product->save();

            $updatedNotes = $lockedTransfer->notes;
            if ($reason) {
                $updatedNotes = trim(($updatedNotes ? $updatedNotes . "\n" : '') . "Rejection reason: {$reason}");
            }

            $lockedTransfer->update([
                'status' => 'rejected',
                'approved_by' => $admin->id,
                'notes' => $updatedNotes,
            ]);

            return $lockedTransfer->fresh(['product', 'supplier', 'approver']);
        });
    }

    /**
     * Admin receives all pending items in a supplier lot number into Admin Warehouse.
     *
     * @return array<int, StockTransfer>
     */
    public function receiveBatchLotInWarehouse(string $lotNumber, User $admin): array
    {
        return DB::transaction(function () use ($lotNumber, $admin) {
            $pendingTransfers = StockTransfer::query()
                ->where('lot_number', $lotNumber)
                ->where('direction', 'supplier_to_warehouse')
                ->where('status', 'pending')
                ->lockForUpdate()
                ->get();

            if ($pendingTransfers->isEmpty()) {
                throw ValidationException::withMessages([
                    'lot_number' => "No pending supplier items found for lot {$lotNumber}.",
                ]);
            }

            $received = [];
            foreach ($pendingTransfers as $transfer) {
                $product = Product::lockForUpdate()->findOrFail($transfer->product_id);
                $product->warehouse_stock += $transfer->quantity;

                if ($transfer->unit_price !== null) {
                    $product->supplier_price = $transfer->unit_price;
                    $product->cost_price = $transfer->unit_price;
                }

                $product->save();

                $transfer->update([
                    'status' => 'received',
                    'approved_by' => $admin->id,
                    'received_at' => now(),
                ]);

                $received[] = $transfer->fresh(['product', 'supplier', 'approver']);
            }

            return $received;
        });
    }

    /**
     * Admin rejects all pending items in a supplier lot number and restores supplier_stock.
     *
     * @return array<int, StockTransfer>
     */
    public function rejectBatchLotFromWarehouse(string $lotNumber, User $admin, ?string $reason = null): array
    {
        return DB::transaction(function () use ($lotNumber, $admin, $reason) {
            $pendingTransfers = StockTransfer::query()
                ->where('lot_number', $lotNumber)
                ->where('direction', 'supplier_to_warehouse')
                ->where('status', 'pending')
                ->lockForUpdate()
                ->get();

            if ($pendingTransfers->isEmpty()) {
                throw ValidationException::withMessages([
                    'lot_number' => "No pending supplier items found for lot {$lotNumber}.",
                ]);
            }

            $rejected = [];
            foreach ($pendingTransfers as $transfer) {
                $product = Product::lockForUpdate()->findOrFail($transfer->product_id);
                $product->supplier_stock += $transfer->quantity;
                $product->save();

                $updatedNotes = $transfer->notes;
                if ($reason) {
                    $updatedNotes = trim(($updatedNotes ? $updatedNotes . "\n" : '') . "Rejection reason: {$reason}");
                }

                $transfer->update([
                    'status' => 'rejected',
                    'approved_by' => $admin->id,
                    'notes' => $updatedNotes,
                ]);

                $rejected[] = $transfer->fresh(['product', 'supplier', 'approver']);
            }

            return $rejected;
        });
    }

    /**
     * Admin transfers stock from Warehouse to Website Catalogue and sets the public selling price.
     */
    public function transferWarehouseToCatalogue(
        Product $product,
        User $admin,
        int $quantity,
        float $sellingPrice,
        ?float $salePrice = null,
        bool $publish = true,
        ?string $notes = null
    ): StockTransfer {
        return DB::transaction(function () use ($product, $admin, $quantity, $sellingPrice, $salePrice, $publish, $notes) {
            $lotNumber = 'CAT-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

            return $this->moveWarehouseToCatalogueLocked(
                $product->id,
                $admin,
                $quantity,
                $sellingPrice,
                $salePrice,
                $publish,
                $lotNumber,
                $notes
            );
        });
    }

    /**
     * Admin bulk-transfers multiple products from Warehouse to Website Catalogue under one lot number.
     *
     * @param  array<int, array{product_id: int|string, quantity: int|string, base_price: float|int|string, sale_price?: float|int|string|null}>  $items
     * @return array<int, StockTransfer>
     */
    public function bulkTransferWarehouseToCatalogue(
        User $admin,
        array $items,
        bool $publish = true,
        ?string $notes = null
    ): array {
        return DB::transaction(function () use ($admin, $items, $publish, $notes) {
            $lotNumber = 'CAT-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
            $transfers = [];

            foreach ($items as $index => $item) {
                $productId = (int) ($item['product_id'] ?? 0);
                $quantity = (int) ($item['quantity'] ?? 0);
                $sellingPrice = (float) ($item['base_price'] ?? 0);
                $salePrice = isset($item['sale_price']) && $item['sale_price'] !== ''
                    ? (float) $item['sale_price']
                    : null;

                $transfers[] = $this->moveWarehouseToCatalogueLocked(
                    $productId,
                    $admin,
                    $quantity,
                    $sellingPrice,
                    $salePrice,
                    $publish,
                    $lotNumber,
                    $notes,
                    "items.{$index}."
                );
            }

            return $transfers;
        });
    }

    private function moveWarehouseToCatalogueLocked(
        int $productId,
        User $admin,
        int $quantity,
        float $sellingPrice,
        ?float $salePrice,
        bool $publish,
        string $lotNumber,
        ?string $notes,
        string $errorPrefix = ''
    ): StockTransfer {
        if ($quantity < 1) {
            throw ValidationException::withMessages([
                "{$errorPrefix}quantity" => 'Transfer quantity must be at least 1 unit.',
            ]);
        }

        if ($sellingPrice <= 0) {
            throw ValidationException::withMessages([
                "{$errorPrefix}base_price" => 'Website selling price must be greater than zero.',
            ]);
        }

        $lockedProduct = Product::lockForUpdate()->findOrFail($productId);

        if ($lockedProduct->warehouse_stock < $quantity) {
            throw ValidationException::withMessages([
                "{$errorPrefix}quantity" => "Insufficient warehouse stock for {$lockedProduct->name}. Available in warehouse: {$lockedProduct->warehouse_stock} units.",
            ]);
        }

        $lockedProduct->warehouse_stock -= $quantity;
        $lockedProduct->stock_quantity += $quantity;
        $lockedProduct->base_price = $sellingPrice;
        $lockedProduct->sale_price = ($salePrice !== null && $salePrice > 0) ? $salePrice : null;
        $lockedProduct->stock_status = $lockedProduct->stock_quantity > 0 ? 'in_stock' : 'out_of_stock';

        if ($publish) {
            $lockedProduct->status = 'published';
        }

        $lockedProduct->save();

        return StockTransfer::create([
            'lot_number' => $lotNumber,
            'product_id' => $lockedProduct->id,
            'supplier_id' => $lockedProduct->supplier_id,
            'initiated_by' => $admin->id,
            'approved_by' => $admin->id,
            'direction' => 'warehouse_to_catalogue',
            'quantity' => $quantity,
            'unit_price' => $sellingPrice,
            'status' => 'received',
            'notes' => $notes,
            'received_at' => now(),
        ]);
    }

    /**
     * Admin returns stock from Website Catalogue back to Admin Warehouse.
     */
    public function returnCatalogueToWarehouse(Product $product, User $admin, int $quantity, ?string $notes = null): StockTransfer
    {
        return DB::transaction(function () use ($product, $admin, $quantity, $notes) {
            if ($quantity < 1) {
                throw ValidationException::withMessages([
                    'quantity' => 'Return quantity must be at least 1 unit.',
                ]);
            }

            $lockedProduct = Product::lockForUpdate()->findOrFail($product->id);

            if ($lockedProduct->stock_quantity < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => "Insufficient catalogue stock for {$lockedProduct->name}. Available in catalogue: {$lockedProduct->stock_quantity} units.",
                ]);
            }

            $lockedProduct->stock_quantity -= $quantity;
            $lockedProduct->warehouse_stock += $quantity;
            $lockedProduct->stock_status = $lockedProduct->stock_quantity > 0 ? 'in_stock' : 'out_of_stock';
            $lockedProduct->save();

            return StockTransfer::create([
                'lot_number' => 'RET-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
                'product_id' => $lockedProduct->id,
                'supplier_id' => $lockedProduct->supplier_id,
                'initiated_by' => $admin->id,
                'approved_by' => $admin->id,
                'direction' => 'catalogue_to_warehouse',
                'quantity' => $quantity,
                'unit_price' => $lockedProduct->base_price,
                'status' => 'received',
                'notes' => $notes,
                'received_at' => now(),
            ]);
        });
    }
}
