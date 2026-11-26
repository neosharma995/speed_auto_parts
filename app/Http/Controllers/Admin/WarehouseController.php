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
        $pendingBaseQuery = StockTransfer::query()
            ->where('direction', 'supplier_to_warehouse')
            ->where('status', 'pending');

        $pendingLotsCount = (clone $pendingBaseQuery)->distinct('lot_number')->count('lot_number');
        $pendingLinesCount = (clone $pendingBaseQuery)->count();
        $pendingUnits = (int) (clone $pendingBaseQuery)->sum('quantity');

        $products = Product::query()
            ->with(['supplier', 'brand', 'category'])
            ->orderByDesc('warehouse_stock')
            ->orderByDesc('updated_at')
            ->paginate(10)
            ->withQueryString();

        $bulkProducts = Product::query()
            ->where('warehouse_stock', '>', 0)
            ->orderByDesc('warehouse_stock')
            ->get();

        $transfersCount = StockTransfer::query()->count();

        $warehouseUnits = (int) Product::sum('warehouse_stock');
        $catalogueUnits = (int) Product::sum('stock_quantity');
        $warehouseValue = (float) Product::selectRaw('COALESCE(SUM(warehouse_stock * COALESCE(supplier_price, cost_price, base_price)), 0) as total')
            ->value('total');

        return Inertia::render('Admin/Warehouse/Index', [
            'pendingLotsCount' => $pendingLotsCount,
            'products' => $products,
            'bulkProducts' => $bulkProducts,
            'transfersCount' => $transfersCount,
            'stats' => [
                'pending_lots_count' => $pendingLotsCount,
                'pending_lines_count' => $pendingLinesCount,
                'pending_units' => $pendingUnits,
                'warehouse_units' => $warehouseUnits,
                'catalogue_units' => $catalogueUnits,
                'warehouse_value' => $warehouseValue,
            ],
        ]);
    }

    public function incoming(): RedirectResponse
    {
        return redirect('/admin/suppliers?tab=incoming');
    }

    public function logs(Request $request): Response
    {
        $query = StockTransfer::query()
            ->with(['product', 'supplier', 'initiator', 'approver']);

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('lot_number', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($pq) use ($search) {
                        $pq->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('direction')) {
            $query->where('direction', (string) $request->input('direction'));
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        $transfers = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Transfers/Logs', [
            'transfers' => $transfers,
            'scope' => 'warehouse',
            'title' => 'Warehouse Stock Transfer Logs',
            'backUrl' => '/admin/warehouse',
            'backLabel' => 'Back to Warehouse',
            'baseUrl' => '/admin/warehouse/logs',
            'filters' => (object) $request->only(['search', 'direction', 'status']),
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
            'stock_quantity' => ['nullable', 'integer', 'min:0'],
        ]);

        $updates = [
            'warehouse_stock' => (int) $validated['warehouse_stock'],
        ];

        if (array_key_exists('stock_quantity', $validated) && $validated['stock_quantity'] !== null) {
            $catQty = (int) $validated['stock_quantity'];
            $updates['stock_quantity'] = $catQty;
            $updates['stock_status'] = $catQty > 0 ? 'in_stock' : 'out_of_stock';
        }

        $product->update($updates);

        return back()->with('success', "Warehouse inventory for '{$product->name}' updated (Warehouse: {$product->warehouse_stock} units, Catalogue: {$product->stock_quantity} units).");
    }
}
