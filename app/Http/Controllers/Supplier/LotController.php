<?php

declare(strict_types=1);

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Services\StockTransferService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LotController extends Controller
{
    public function __construct(
        protected StockTransferService $stockTransferService
    ) {}

    public function index(Request $request): Response
    {
        $supplier = $request->user();

        $products = Product::query()
            ->where('supplier_id', $supplier->id)
            ->with(['brand', 'category'])
            ->orderBy('name')
            ->get();

        $lots = StockTransfer::query()
            ->where('supplier_id', $supplier->id)
            ->where('direction', 'supplier_to_warehouse')
            ->with(['product', 'approver'])
            ->latest()
            ->take(50)
            ->get();

        return Inertia::render('Supplier/Lots/Index', [
            'products' => $products,
            'lots' => $lots,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $transfers = $this->stockTransferService->sendLotToWarehouse(
            $request->user(),
            $validated['items'],
            $validated['notes'] ?? null
        );

        $lotNumber = $transfers[0]->lot_number ?? '';
        $itemCount = count($transfers);
        $totalQty = collect($transfers)->sum('quantity');

        return back()->with('success', "Lot {$lotNumber} ({$itemCount} items, {$totalQty} units) dispatched to Admin Warehouse for receiving.");
    }
}
