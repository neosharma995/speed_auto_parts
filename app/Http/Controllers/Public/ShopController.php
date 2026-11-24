<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->__invoke($request);
    }

    public function __invoke(Request $request): Response
    {
        $query = Product::published()->with(['brand', 'category', 'variations']);

        // 1. Category Filter
        if ($categorySlug = $request->input('category')) {
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // 2. Brand Filter
        if ($brandSlug = $request->input('brand')) {
            $query->whereHas('brand', function ($q) use ($brandSlug) {
                $q->where('slug', $brandSlug);
            });
        }

        // 3. Vehicle Fitment Filter
        $vehicleId = $request->input('vehicle_id', session('active_vehicle.id'));
        if ($vehicleId) {
            $query->whereHas('productVehicles', function ($q) use ($vehicleId) {
                $q->where('vehicle_id', $vehicleId);
            });
        }

        // 4. Part Number Filter
        if ($partNumber = $request->input('part_number')) {
            $query->where(function ($q) use ($partNumber) {
                $q->where('part_number', 'like', "%{$partNumber}%")
                  ->orWhere('sku', 'like', "%{$partNumber}%")
                  ->orWhereHas('variations', function ($vq) use ($partNumber) {
                      $vq->where('part_number', 'like', "%{$partNumber}%")
                         ->orWhere('sku', 'like', "%{$partNumber}%");
                  });
            });
        }

        // 5. Keyword search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('part_number', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // 6. Price range
        if ($minPrice = $request->input('min_price')) {
            $query->where('base_price', '>=', (float) $minPrice);
        }
        if ($maxPrice = $request->input('max_price')) {
            $query->where('base_price', '<=', (float) $maxPrice);
        }

        // 7. In stock only
        if ($request->boolean('in_stock')) {
            $query->where('stock_status', 'in_stock')->where('stock_quantity', '>', 0);
        }

        // 8. Sorting
        $sort = $request->input('sort', 'latest');
        match ($sort) {
            'price_asc' => $query->orderBy('base_price', 'asc'),
            'price_desc' => $query->orderBy('base_price', 'desc'),
            'rating' => $query->orderByDesc('rating'),
            default => $query->orderByDesc('created_at'),
        };

        $products = $query->paginate(12)->withQueryString();

        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']);
        $brands = Brand::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']);
        $activeVehicle = $vehicleId ? Vehicle::find($vehicleId) : null;

        return Inertia::render('Public/Shop', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'filters' => (object) $request->only(['category', 'brand', 'sort', 'min_price', 'max_price', 'in_stock', 'part_number', 'vehicle_id', 'search']),
            'activeVehicle' => $activeVehicle,
        ]);
    }

    public function suggestions(Request $request): JsonResponse
    {
        $query = trim((string) $request->input('q', ''));

        if ($query === '') {
            $popularCategories = Category::where('is_active', true)
                ->orderBy('sort_order')
                ->limit(5)
                ->get(['id', 'name', 'slug']);

            $featuredBrands = Brand::where('is_active', true)
                ->where('is_featured', true)
                ->limit(5)
                ->get(['id', 'name', 'slug']);

            return response()->json([
                'query' => '',
                'products' => [],
                'categories' => $popularCategories,
                'brands' => $featuredBrands,
                'popularSearches' => [
                    'Brembo Big Brake Kit',
                    'Michelin Pilot Sport 5',
                    'Performance Cat-Back Exhaust',
                    'Cold Air Intake System',
                    'Bilstein Coilovers',
                    'AP-12345',
                ],
            ]);
        }

        // 1. Search products by name, part_number, sku, brand, category
        $products = Product::published()
            ->with(['brand:id,name,slug', 'category:id,name,slug'])
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('part_number', 'like', "%{$query}%")
                  ->orWhere('sku', 'like', "%{$query}%")
                  ->orWhereHas('brand', fn($b) => $b->where('name', 'like', "%{$query}%"))
                  ->orWhereHas('category', fn($c) => $c->where('name', 'like', "%{$query}%"));
            })
            ->select([
                'id', 'name', 'slug', 'sku', 'part_number', 'brand_id', 'category_id',
                'main_image', 'base_price', 'sale_price', 'stock_quantity', 'stock_status'
            ])
            ->limit(5)
            ->get()
            ->map(function ($product) {
                $basePrice = (float) $product->base_price;
                $effectivePrice = (float) $product->effective_price;
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'sku' => $product->sku,
                    'part_number' => $product->part_number,
                    'brand_name' => $product->brand?->name,
                    'category_name' => $product->category?->name,
                    'main_image' => $product->main_image,
                    'effective_price' => $effectivePrice,
                    'base_price' => $basePrice,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'discount_percentage' => $product->discount_percentage,
                    'is_in_stock' => $product->is_in_stock,
                    'url' => route('products.show', $product->slug),
                ];
            });

        // 2. Matching Categories
        $categories = Category::where('is_active', true)
            ->where('name', 'like', "%{$query}%")
            ->select(['id', 'name', 'slug'])
            ->limit(3)
            ->get()
            ->map(fn($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'url' => route('shop', ['category' => $cat->slug]),
            ]);

        // 3. Matching Brands
        $brands = Brand::where('is_active', true)
            ->where('name', 'like', "%{$query}%")
            ->select(['id', 'name', 'slug', 'logo'])
            ->limit(3)
            ->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'slug' => $b->slug,
                'logo' => $b->logo,
                'url' => route('shop', ['brand' => $b->slug]),
            ]);

        // Total count for "View all X results"
        $totalCount = Product::published()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('part_number', 'like', "%{$query}%")
                  ->orWhere('sku', 'like', "%{$query}%")
                  ->orWhereHas('brand', fn($b) => $b->where('name', 'like', "%{$query}%"))
                  ->orWhereHas('category', fn($c) => $c->where('name', 'like', "%{$query}%"));
            })
            ->count();

        return response()->json([
            'query' => $query,
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'total_count' => $totalCount,
        ]);
    }
}
