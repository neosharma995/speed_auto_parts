<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Services\StockTransferService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    public function __construct(
        protected StockTransferService $stockTransferService
    ) {}

    public function index(): Response
    {
        $pendingLots = StockTransfer::query()
            ->where('direction', 'supplier_to_warehouse')
            ->where('status', 'pending')
            ->with(['product.brand', 'product.category', 'supplier'])
            ->latest()
            ->get();

        $products = Product::query()
            ->with(['supplier', 'brand', 'category'])
            ->orderByDesc('warehouse_stock')
            ->orderByDesc('updated_at')
            ->get();

        $recentTransfers = StockTransfer::query()
            ->with(['product', 'supplier', 'initiator', 'approver'])
            ->latest()
            ->take(30)
            ->get();

        $warehouseUnits = (int) Product::sum('warehouse_stock');
        $catalogueUnits = (int) Product::sum('stock_quantity');
        $warehouseValue = (float) Product::selectRaw('COALESCE(SUM(warehouse_stock * COALESCE(supplier_price, cost_price, base_price)), 0) as total')
            ->value('total');

        return Inertia::render('Admin/Warehouse/Index', [
            'pendingLots' => $pendingLots,
            'products' => $products,
            'recentTransfers' => $recentTransfers,
            'stats' => [
                'pending_lots_count' => $pendingLots->count(),
                'pending_units' => (int) $pendingLots->sum('quantity'),
                'warehouse_units' => $warehouseUnits,
                'catalogue_units' => $catalogueUnits,
                'warehouse_value' => $warehouseValue,
            ],
        ]);
    }

    public function receiveLot(StockTransfer $transfer, Request $request): RedirectResponse
    {
        $received = $this->stockTransferService->receiveLotInWarehouse($transfer, $request->user());

        return back()->with('success', "Lot {$received->lot_number} (+{$received->quantity} units of {$received->product?->name}) received into Admin Warehouse.");
    }

    public function rejectLot(StockTransfer $transfer, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $rejected = $this->stockTransferService->rejectLotFromWarehouse(
            $transfer,
            $request->user(),
            $validated['reason'] ?? null
        );

        return back()->with('success', "Lot {$rejected->lot_number} rejected and {$rejected->quantity} units returned to supplier stock.");
    }

    public function receiveLotBatch(string $lotNumber, Request $request): RedirectResponse
    {
        $received = $this->stockTransferService->receiveBatchLotInWarehouse($lotNumber, $request->user());
        $itemCount = count($received);
        $totalQty = collect($received)->sum('quantity');

        return back()->with('success', "Lot {$lotNumber} ({$itemCount} items, +{$totalQty} units) received into Admin Warehouse.");
    }

    public function rejectLotBatch(string $lotNumber, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $rejected = $this->stockTransferService->rejectBatchLotFromWarehouse(
            $lotNumber,
            $request->user(),
            $validated['reason'] ?? null
        );
        $itemCount = count($rejected);
        $totalQty = collect($rejected)->sum('quantity');

        return back()->with('success', "Lot {$lotNumber} ({$itemCount} items, {$totalQty} units) rejected and returned to supplier stock.");
    }

    public function adjustStock(Product $product, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'warehouse_stock' => ['required', 'integer', 'min:0'],
        ]);

        $product->update([
            'warehouse_stock' => (int) $validated['warehouse_stock'],
        ]);

        return back()->with('success', "Warehouse stock for '{$product->name}' updated to {$product->warehouse_stock} units.");
    }
}
