<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
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
            ->with(['brand', 'category', 'supplier'])
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
            'product_attributes' => ['nullable', 'array'],
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

        $this->syncProductAttributes($product, $validated);
        $this->syncProductVariations($product, $validated);

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
        $product->load(['variations', 'attributes.values', 'productVehicles']);

        $allAttributesBySlug = ProductAttribute::with('values')->get()->keyBy('slug');
        $productAttributesMap = [];

        foreach ($product->attributes as $attr) {
            $productAttributesMap[$attr->slug] = [
                'id' => $attr->id,
                'name' => $attr->name,
                'slug' => $attr->slug,
                'values' => $attr->values->pluck('value')->values()->toArray(),
                'used_for_variations' => $product->product_type === 'variable',
            ];
        }

        foreach ($product->variations as $variation) {
            $attrJson = is_array($variation->attributes_json) ? $variation->attributes_json : [];
            foreach ($attrJson as $attrSlug => $attrValue) {
                $valStr = trim((string) $attrValue);
                if ($valStr === '') {
                    continue;
                }
                if (!isset($productAttributesMap[$attrSlug])) {
                    $matched = $allAttributesBySlug->get($attrSlug);
                    $productAttributesMap[$attrSlug] = [
                        'id' => $matched?->id,
                        'name' => $matched?->name ?? Str::title(str_replace('-', ' ', $attrSlug)),
                        'slug' => $attrSlug,
                        'values' => [],
                        'used_for_variations' => true,
                    ];
                } else {
                    $productAttributesMap[$attrSlug]['used_for_variations'] = true;
                }
                if (!in_array($valStr, $productAttributesMap[$attrSlug]['values'], true)) {
                    $productAttributesMap[$attrSlug]['values'][] = $valStr;
                }
            }
        }

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
                'product_attributes' => array_values($productAttributesMap),
                'variations' => $product->variations->map(fn ($v) => [
                    'id' => $v->id,
                    'name' => $v->name,
                    'sku' => $v->sku,
                    'part_number' => $v->part_number,
                    'attributes_json' => $v->attributes_json ?? [],
                    'price' => $v->price,
                    'sale_price' => $v->sale_price,
                    'stock_quantity' => $v->stock_quantity,
                    'stock_status' => $v->stock_status,
                    'image' => $v->image,
                    'weight' => $v->weight,
                    'is_default' => (bool) $v->is_default,
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
            'product_attributes' => ['nullable', 'array'],
            'variations' => ['nullable', 'array'],
            'vehicle_ids' => ['nullable', 'array'],
            'fitment_notes' => ['nullable', 'string'],
            'seo_title' => ['nullable', 'string'],
            'seo_description' => ['nullable', 'string'],
        ]);

        $product->update($validated);

        $this->syncProductAttributes($product, $validated);
        $this->syncProductVariations($product, $validated);

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

    /**
     * Sync product attributes and auto-create custom attributes and values inline.
     */
    protected function syncProductAttributes(Product $product, array $validated): void
    {
        if (array_key_exists('product_attributes', $validated) && is_array($validated['product_attributes'])) {
            $attributeIds = [];

            foreach ($validated['product_attributes'] as $entry) {
                $name = trim((string) ($entry['name'] ?? ''));
                if ($name === '') {
                    continue;
                }

                $slug = !empty($entry['slug']) ? Str::slug((string) $entry['slug']) : Str::slug($name);
                if ($slug === '') {
                    continue;
                }

                $attr = null;
                if (!empty($entry['id']) && is_numeric($entry['id'])) {
                    $attr = ProductAttribute::find((int) $entry['id']);
                }

                if (!$attr) {
                    $attr = ProductAttribute::firstOrCreate(
                        ['slug' => $slug],
                        ['name' => $name]
                    );
                }

                foreach ((array) ($entry['values'] ?? []) as $rawVal) {
                    $val = trim((string) $rawVal);
                    if ($val === '') {
                        continue;
                    }
                    $valSlug = Str::slug($val) ?: strtolower(preg_replace('/\s+/', '-', $val));
                    ProductAttributeValue::firstOrCreate(
                        ['attribute_id' => $attr->id, 'slug' => $valSlug],
                        ['value' => $val]
                    );
                }

                $attributeIds[] = $attr->id;
            }

            $product->attributes()->sync(array_values(array_unique($attributeIds)));
            return;
        }

        if (array_key_exists('attributes', $validated)) {
            $product->attributes()->sync($validated['attributes'] ?? []);
        }
    }

    /**
     * Sync product variations for variable products or remove variations for simple products.
     */
    protected function syncProductVariations(Product $product, array $validated): void
    {
        if ($validated['product_type'] !== 'variable') {
            $product->variations()->delete();
            return;
        }

        $variations = (array) ($validated['variations'] ?? []);
        $existingIds = $product->variations()->pluck('id')->toArray();
        $keptIds = [];
        $hasExplicitDefault = collect($variations)->contains(fn ($v) => !empty($v['is_default']));
        $assignedDefault = false;

        foreach ($variations as $idx => $var) {
            $qty = (int) ($var['stock_quantity'] ?? 0);
            $stockStatus = in_array($var['stock_status'] ?? '', ['in_stock', 'out_of_stock', 'on_backorder'], true)
                ? $var['stock_status']
                : ($qty > 0 ? 'in_stock' : 'out_of_stock');

            $isDefault = false;
            if ($hasExplicitDefault) {
                if (!empty($var['is_default']) && !$assignedDefault) {
                    $isDefault = true;
                    $assignedDefault = true;
                }
            } elseif ($idx === 0) {
                $isDefault = true;
            }

            $rawPrice = $var['price'] ?? null;
            $rawSale = $var['sale_price'] ?? null;
            $rawWeight = $var['weight'] ?? null;

            $data = [
                'name' => trim((string) ($var['name'] ?? '')) ?: ('Variation #' . ($idx + 1)),
                'sku' => trim((string) ($var['sku'] ?? '')) ?: ($product->sku . '-V' . ($idx + 1) . '-' . strtoupper(Str::random(3))),
                'part_number' => trim((string) ($var['part_number'] ?? '')) ?: ($product->part_number . '-V' . ($idx + 1)),
                'attributes_json' => is_array($var['attributes_json'] ?? null) ? $var['attributes_json'] : null,
                'price' => ($rawPrice !== null && $rawPrice !== '') ? (float) $rawPrice : (float) $product->base_price,
                'sale_price' => ($rawSale !== null && $rawSale !== '') ? (float) $rawSale : null,
                'stock_quantity' => $qty,
                'stock_status' => $stockStatus,
                'image' => !empty($var['image']) ? (string) $var['image'] : null,
                'weight' => ($rawWeight !== null && $rawWeight !== '') ? (float) $rawWeight : null,
                'is_default' => $isDefault,
            ];

            if (!empty($var['id']) && is_numeric($var['id']) && in_array((int) $var['id'], $existingIds, true)) {
                $varId = (int) $var['id'];
                ProductVariation::where('id', $varId)->update($data);
                $keptIds[] = $varId;
            } else {
                $newVar = ProductVariation::create(array_merge(['product_id' => $product->id], $data));
                $keptIds[] = $newVar->id;
            }
        }

        $toDelete = array_diff($existingIds, $keptIds);
        if (!empty($toDelete)) {
            ProductVariation::whereIn('id', $toDelete)->delete();
        }
    }
}
