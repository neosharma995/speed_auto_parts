<?php

declare(strict_types=1);

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\StockTransferService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected StockTransferService $stockTransferService
    ) {}

    public function index(Request $request): Response
    {
        $supplier = $request->user();

        $query = Product::query()
            ->where('supplier_id', $supplier->id)
            ->with(['brand', 'category']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('part_number', 'like', "%{$search}%");
            });
        }

        $products = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Supplier/Products/Index', [
            'products' => $products,
            'categories' => Category::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters' => (object) $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'part_number' => ['required', 'string', 'max:100', 'unique:products,part_number'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'supplier_price' => ['required', 'numeric', 'min:0.01'],
            'supplier_stock' => ['required', 'integer', 'min:0'],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'main_image' => ['nullable', 'string', 'max:500'],
            'send_lot_now' => ['boolean'],
            'lot_quantity' => ['nullable', 'integer', 'min:1'],
            'lot_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $supplier = $request->user();
        $supplierPrice = (float) $validated['supplier_price'];

        $lotCreated = null;

        DB::transaction(function () use ($validated, $supplier, $supplierPrice, &$lotCreated) {
            $baseSlug = Str::slug($validated['name']);
            $slug = $baseSlug . '-' . strtolower(Str::random(4));

            $product = Product::create([
                'supplier_id' => $supplier->id,
                'category_id' => $validated['category_id'] ?? null,
                'brand_id' => $validated['brand_id'] ?? null,
                'name' => $validated['name'],
                'slug' => $slug,
                'sku' => $validated['sku'],
                'part_number' => $validated['part_number'],
                'short_description' => $validated['short_description'] ?? null,
                'description' => $validated['description'] ?? null,
                'main_image' => ! empty($validated['main_image']) ? $validated['main_image'] : '/images/products/placeholder.jpg',
                'product_type' => 'simple',
                'base_price' => $supplierPrice,
                'cost_price' => $supplierPrice,
                'supplier_price' => $supplierPrice,
                'stock_quantity' => 0,
                'supplier_stock' => (int) $validated['supplier_stock'],
                'warehouse_stock' => 0,
                'stock_status' => 'out_of_stock',
                'status' => 'draft',
            ]);

            if (! empty($validated['send_lot_now']) && ! empty($validated['lot_quantity'])) {
                $transfers = $this->stockTransferService->sendLotToWarehouse(
                    $supplier,
                    [[
                        'product_id' => $product->id,
                        'quantity' => (int) $validated['lot_quantity'],
                        'unit_price' => $supplierPrice,
                    ]],
                    $validated['lot_notes'] ?? 'Initial lot dispatched with new product creation'
                );
                $lotCreated = $transfers[0]->lot_number ?? null;
            }
        });

        $msg = "Product '{$validated['name']}' created.";
        if ($lotCreated) {
            $msg .= " Lot {$lotCreated} dispatched to Admin Warehouse (pending receipt).";
        }

        return back()->with('success', $msg);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        if ((int) $product->supplier_id !== (int) $request->user()->id) {
            abort(403, 'You can only update your own products.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'supplier_price' => ['required', 'numeric', 'min:0.01'],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'main_image' => ['nullable', 'string', 'max:500'],
        ]);

        $product->update([
            'name' => $validated['name'],
            'category_id' => $validated['category_id'] ?? null,
            'brand_id' => $validated['brand_id'] ?? null,
            'supplier_price' => $validated['supplier_price'],
            'cost_price' => $validated['supplier_price'],
            'short_description' => $validated['short_description'] ?? null,
            'description' => $validated['description'] ?? null,
            'main_image' => ! empty($validated['main_image']) ? $validated['main_image'] : $product->main_image,
        ]);

        return back()->with('success', "Product '{$product->name}' updated.");
    }

    public function restock(Request $request, Product $product): RedirectResponse
    {
        if ((int) $product->supplier_id !== (int) $request->user()->id) {
            abort(403, 'You can only restock your own products.');
        }

        $validated = $request->validate([
            'add_quantity' => ['nullable', 'integer', 'min:1'],
            'supplier_stock' => ['nullable', 'integer', 'min:0'],
            'supplier_price' => ['nullable', 'numeric', 'min:0.01'],
        ]);

        if (isset($validated['add_quantity'])) {
            $product->supplier_stock += (int) $validated['add_quantity'];
        } elseif (isset($validated['supplier_stock'])) {
            $product->supplier_stock = (int) $validated['supplier_stock'];
        }

        if (isset($validated['supplier_price'])) {
            $product->supplier_price = (float) $validated['supplier_price'];
            $product->cost_price = (float) $validated['supplier_price'];
        }

        $product->save();

        return back()->with('success', "Supplier stock for '{$product->name}' updated to {$product->supplier_stock} units.");
    }
}
