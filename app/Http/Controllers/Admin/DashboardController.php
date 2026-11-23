<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Vehicle;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalProducts = Product::query()->count();
        $totalCategories = Category::query()->count();
        $totalBrands = Brand::query()->count();
        $totalVehicles = Vehicle::query()->count();

        $recentProducts = Product::query()
            ->with(['brand', 'category'])
            ->latest()
            ->take(8)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_products' => $totalProducts,
                'total_categories' => $totalCategories,
                'total_brands' => $totalBrands,
                'total_vehicles' => $totalVehicles,
            ],
            'recentProducts' => $recentProducts,
        ]);
    }
}
