<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductVariation;
use App\Models\ProductVehicle;
use App\Models\TaxClass;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()
            ->with(['brand', 'category'])
            ->withCount('variations');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('part_number', 'like', "%{$search}%");
            });
        }

        if ($catId = $request->query('category')) {
            $query->where('category_id', $catId);
        }

        if ($brandId = $request->query('brand')) {
            $query->where('brand_id', $brandId);
        }

        $products = $query->latest()->paginate(15)->withQueryString();
        $categories = Category::query()->orderBy('name')->get();
        $brands = Brand::query()->orderBy('name')->get();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'filters' => (object) $request->only(['search', 'category', 'brand']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => Category::query()->orderBy('name')->get(),
            'brands' => Brand::query()->orderBy('name')->get(),
            'taxClasses' => TaxClass::query()->with('rates')->get(),
            'attributes' => ProductAttribute::query()->with('values')->get(),
            'vehicles' => Vehicle::query()->orderBy('year', 'desc')->orderBy('make')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'part_number' => ['required', 'string', 'max:100', 'unique:products,part_number'],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'technical_specifications' => ['nullable', 'string'],
            'product_type' => ['required', 'in:simple,variable'],
            'status' => ['required', 'in:draft,published,archived'],
            'is_featured' => ['boolean'],
            'is_best_seller' => ['boolean'],
            'is_new_arrival' => ['boolean'],
            'main_image' => ['nullable', 'string'],
            'gallery_images' => ['nullable', 'array'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'stock_status' => ['required', 'in:in_stock,out_of_stock,on_backorder'],
            'weight' => ['nullable', 'numeric'],
            'weight_unit' => ['nullable', 'string'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'tax_class_id' => ['nullable', 'exists:tax_classes,id'],
            'attributes' => ['nullable', 'array'],
            'variations' => ['nullable', 'array'],
            'vehicle_ids' => ['nullable', 'array'],
            'fitment_notes' => ['nullable', 'string'],
            'seo_title' => ['nullable', 'string'],
            'seo_description' => ['nullable', 'string'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product = Product::create($validated);

        // Sync attributes
        if (!empty($validated['attributes'])) {
            $product->attributes()->sync($validated['attributes']);
        }

        // Save variations if variable product
        if ($validated['product_type'] === 'variable' && !empty($validated['variations'])) {
            foreach ($validated['variations'] as $idx => $var) {
                ProductVariation::create([
                    'product_id' => $product->id,
                    'name' => $var['name'] ?? "Variation #{$idx}",
                    'sku' => $var['sku'] ?? ($product->sku . "-V{$idx}"),
                    'part_number' => $var['part_number'] ?? ($product->part_number . "-V{$idx}"),
                    'price' => $var['price'] ?? $product->base_price,
                    'sale_price' => $var['sale_price'] ?? null,
                    'stock_quantity' => $var['stock_quantity'] ?? 10,
                    'stock_status' => ($var['stock_quantity'] ?? 10) > 0 ? 'in_stock' : 'out_of_stock',
                    'is_default' => $idx === 0,
                ]);
            }
        }

        // Sync vehicle fitment
        if (!empty($validated['vehicle_ids'])) {
            foreach ($validated['vehicle_ids'] as $vehId) {
                ProductVehicle::create([
                    'product_id' => $product->id,
                    'vehicle_id' => $vehId,
                    'notes' => $validated['fitment_notes'] ?? null,
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('success', "Product '{$product->name}' created successfully.");
    }

    public function edit(Product $product): Response
    {
        $product->load(['variations', 'attributes', 'productVehicles']);

        return Inertia::render('Admin/Products/Edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'part_number' => $product->part_number,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'technical_specifications' => $product->technical_specifications,
                'product_type' => $product->product_type,
                'status' => $product->status,
                'is_featured' => $product->is_featured,
                'is_best_seller' => $product->is_best_seller,
                'is_new_arrival' => $product->is_new_arrival,
                'main_image' => $product->main_image,
                'gallery_images' => $product->gallery_images ?? [],
                'base_price' => $product->base_price,
                'sale_price' => $product->sale_price,
                'cost_price' => $product->cost_price,
                'stock_quantity' => $product->stock_quantity,
                'stock_status' => $product->stock_status,
                'weight' => $product->weight,
                'weight_unit' => $product->weight_unit ?? 'kg',
                'category_id' => $product->category_id,
                'brand_id' => $product->brand_id,
                'tax_class_id' => $product->tax_class_id,
                'seo_title' => $product->seo_title,
                'seo_description' => $product->seo_description,
                'attributes' => $product->attributes->pluck('id')->toArray(),
                'variations' => $product->variations->map(fn ($v) => [
                    'id' => $v->id,
                    'name' => $v->name,
                    'sku' => $v->sku,
                    'part_number' => $v->part_number,
                    'price' => $v->price,
                    'sale_price' => $v->sale_price,
                    'stock_quantity' => $v->stock_quantity,
                    'stock_status' => $v->stock_status,
                ])->toArray(),
                'vehicle_ids' => $product->productVehicles->pluck('vehicle_id')->toArray(),
                'fitment_notes' => $product->productVehicles->first()?->notes ?? '',
            ],
            'categories' => Category::query()->orderBy('name')->get(),
            'brands' => Brand::query()->orderBy('name')->get(),
            'taxClasses' => TaxClass::query()->with('rates')->get(),
            'attributes' => ProductAttribute::query()->with('values')->get(),
            'vehicles' => Vehicle::query()->orderBy('year', 'desc')->orderBy('make')->get(),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', "unique:products,slug,{$product->id}"],
            'sku' => ['required', 'string', 'max:100', "unique:products,sku,{$product->id}"],
            'part_number' => ['required', 'string', 'max:100', "unique:products,part_number,{$product->id}"],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'technical_specifications' => ['nullable', 'string'],
            'product_type' => ['required', 'in:simple,variable'],
            'status' => ['required', 'in:draft,published,archived'],
            'is_featured' => ['boolean'],
            'is_best_seller' => ['boolean'],
            'is_new_arrival' => ['boolean'],
            'main_image' => ['nullable', 'string'],
            'gallery_images' => ['nullable', 'array'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'stock_status' => ['required', 'in:in_stock,out_of_stock,on_backorder'],
            'weight' => ['nullable', 'numeric'],
            'weight_unit' => ['nullable', 'string'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'tax_class_id' => ['nullable', 'exists:tax_classes,id'],
            'attributes' => ['nullable', 'array'],
            'variations' => ['nullable', 'array'],
            'vehicle_ids' => ['nullable', 'array'],
            'fitment_notes' => ['nullable', 'string'],
            'seo_title' => ['nullable', 'string'],
            'seo_description' => ['nullable', 'string'],
        ]);

        $product->update($validated);

        // Sync attributes
        $product->attributes()->sync($validated['attributes'] ?? []);

        // Manage variations
        if ($validated['product_type'] === 'variable' && !empty($validated['variations'])) {
            $existingVariationIds = $product->variations()->pluck('id')->toArray();
            $keptVariationIds = [];

            foreach ($validated['variations'] as $idx => $var) {
                if (!empty($var['id']) && in_array($var['id'], $existingVariationIds)) {
                    ProductVariation::where('id', $var['id'])->update([
                        'name' => $var['name'],
                        'sku' => $var['sku'],
                        'part_number' => $var['part_number'],
                        'price' => $var['price'],
                        'sale_price' => $var['sale_price'] ?? null,
                        'stock_quantity' => $var['stock_quantity'] ?? 0,
                        'stock_status' => ($var['stock_quantity'] ?? 0) > 0 ? 'in_stock' : 'out_of_stock',
                    ]);
                    $keptVariationIds[] = $var['id'];
                } else {
                    $newVar = ProductVariation::create([
                        'product_id' => $product->id,
                        'name' => $var['name'] ?? "Variation #{$idx}",
                        'sku' => $var['sku'] ?? ($product->sku . "-V" . Str::random(4)),
                        'part_number' => $var['part_number'] ?? ($product->part_number . "-V" . Str::random(4)),
                        'price' => $var['price'] ?? $product->base_price,
                        'sale_price' => $var['sale_price'] ?? null,
                        'stock_quantity' => $var['stock_quantity'] ?? 10,
                        'stock_status' => ($var['stock_quantity'] ?? 10) > 0 ? 'in_stock' : 'out_of_stock',
                        'is_default' => $idx === 0,
                    ]);
                    $keptVariationIds[] = $newVar->id;
                }
            }

            // Delete removed variations
            $toDelete = array_diff($existingVariationIds, $keptVariationIds);
            if (!empty($toDelete)) {
                ProductVariation::whereIn('id', $toDelete)->delete();
            }
        }

        // Manage fitment
        ProductVehicle::where('product_id', $product->id)->delete();
        if (!empty($validated['vehicle_ids'])) {
            foreach ($validated['vehicle_ids'] as $vehId) {
                ProductVehicle::create([
                    'product_id' => $product->id,
                    'vehicle_id' => $vehId,
                    'notes' => $validated['fitment_notes'] ?? null,
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('success', "Product '{$product->name}' updated successfully.");
    }

    public function destroy(Product $product): RedirectResponse
    {
        $name = $product->name;
        $product->delete();

        return redirect()->route('admin.products.index')->with('success', "Product '{$name}' deleted successfully.");
    }
}
