<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Vehicle;
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
            'filters' => $request->only(['category', 'brand', 'sort', 'min_price', 'max_price', 'in_stock', 'part_number', 'vehicle_id', 'search']),
            'activeVehicle' => $activeVehicle,
        ]);
    }
}
