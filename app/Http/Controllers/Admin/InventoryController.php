<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(): Response
    {
        $products = Product::query()
            ->with(['brand', 'category'])
            ->orderBy('stock_quantity')
            ->get();

        return Inertia::render('Admin/Inventory/Index', [
            'products' => $products,
        ]);
    }

    public function adjust(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $qty = (int) $validated['quantity'];
        $product->update([
            'stock_quantity' => $qty,
            'stock_status' => $qty > 0 ? 'in_stock' : 'out_of_stock',
        ]);

        return back()->with('success', "Stock for {$product->name} updated to {$qty}.");
    }
}
