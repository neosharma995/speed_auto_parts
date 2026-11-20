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

class CatalogueController extends Controller
{
    public function __construct(
        protected StockTransferService $stockTransferService
    ) {}

    public function index(Request $request): Response
    {
        $query = Product::query()->with(['supplier', 'brand', 'category']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('part_number', 'like', "%{$search}%");
            });
        }

        $filter = $request->query('filter', 'all');
        match ($filter) {
            'warehouse' => $query->where('warehouse_stock', '>', 0),
            'published' => $query->where('status', 'published'),
            'draft' => $query->where('status', 'draft'),
            default => null,
        };

        $products = $query->orderByDesc('warehouse_stock')->latest()->get();

        $recentTransfers = StockTransfer::query()
            ->whereIn('direction', ['warehouse_to_catalogue', 'catalogue_to_warehouse'])
            ->with(['product', 'initiator'])
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('Admin/Catalogue/Index', [
            'products' => $products,
            'recentTransfers' => $recentTransfers,
            'filters' => (object) $request->only(['search', 'filter']),
            'stats' => [
                'published_count' => Product::where('status', 'published')->count(),
                'ready_in_warehouse_count' => Product::where('warehouse_stock', '>', 0)->count(),
                'catalogue_units' => (int) Product::sum('stock_quantity'),
                'warehouse_units' => (int) Product::sum('warehouse_stock'),
            ],
        ]);
    }

    public function transferFromWarehouse(Product $product, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
            'base_price' => ['required', 'numeric', 'min:0.01'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'publish' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $transfer = $this->stockTransferService->transferWarehouseToCatalogue(
            $product,
            $request->user(),
            (int) $validated['quantity'],
            (float) $validated['base_price'],
            isset($validated['sale_price']) && $validated['sale_price'] !== '' ? (float) $validated['sale_price'] : null,
            (bool) ($validated['publish'] ?? true),
            $validated['notes'] ?? null
        );

        return back()->with('success', "Transferred {$transfer->quantity} units of '{$product->name}' to Website Catalogue at ₹{$validated['base_price']}.");
    }

    public function bulkTransferFromWarehouse(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.base_price' => ['required', 'numeric', 'min:0.01'],
            'items.*.sale_price' => ['nullable', 'numeric', 'min:0'],
            'publish' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $transfers = $this->stockTransferService->bulkTransferWarehouseToCatalogue(
            $request->user(),
            $validated['items'],
            (bool) ($validated['publish'] ?? true),
            $validated['notes'] ?? null
        );

        $lotNumber = $transfers[0]->lot_number ?? '';
        $itemCount = count($transfers);
        $totalQty = collect($transfers)->sum('quantity');

        return back()->with('success', "Batch {$lotNumber}: transferred {$itemCount} items ({$totalQty} units) to Website Catalogue.");
    }

    public function returnToWarehouse(Product $product, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $transfer = $this->stockTransferService->returnCatalogueToWarehouse(
            $product,
            $request->user(),
            (int) $validated['quantity'],
            $validated['notes'] ?? null
        );

        return back()->with('success', "Returned {$transfer->quantity} units of '{$product->name}' back to Admin Warehouse.");
    }

    public function toggleStatus(Product $product): RedirectResponse
    {
        $newStatus = $product->status === 'published' ? 'draft' : 'published';
        $product->update(['status' => $newStatus]);

        return back()->with('success', "Product '{$product->name}' is now {$newStatus}.");
    }

    public function updatePrice(Product $product, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'base_price' => ['required', 'numeric', 'min:0.01'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $salePrice = isset($validated['sale_price']) && $validated['sale_price'] !== '' && (float) $validated['sale_price'] > 0
            ? (float) $validated['sale_price']
            : null;

        $product->update([
            'base_price' => (float) $validated['base_price'],
            'sale_price' => $salePrice,
        ]);

        return back()->with('success', "Selling price for '{$product->name}' updated to ₹{$validated['base_price']}.");
    }
}
