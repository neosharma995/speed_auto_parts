<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->__invoke($request);
    }

    public function __invoke(Request $request): Response
    {
        $categories = Category::where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('sort_order')
            ->take(6)
            ->get();

        $featuredProducts = Product::published()
            ->featured()
            ->with(['brand', 'category', 'variations'])
            ->take(8)
            ->get();

        $bestSellers = Product::published()
            ->bestSeller()
            ->with(['brand', 'category', 'variations'])
            ->take(4)
            ->get();

        $newArrivals = Product::published()
            ->newArrival()
            ->with(['brand', 'category', 'variations'])
            ->take(4)
            ->get();

        $brands = Brand::where('is_active', true)
            ->where('is_featured', true)
            ->take(8)
            ->get();

        return Inertia::render('Public/Welcome', [
            'categories' => $categories,
            'featuredProducts' => $featuredProducts,
            'bestSellers' => $bestSellers,
            'newArrivals' => $newArrivals,
            'brands' => $brands,
        ]);
    }
}
