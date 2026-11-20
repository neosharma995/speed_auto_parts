<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalSales = Order::query()
            ->where('payment_status', 'paid')
            ->sum('total_amount');

        $totalOrders = Order::query()->count();

        $totalCustomers = User::query()
            ->whereHas('roles', fn ($q) => $q->where('name', 'customer'))
            ->count();

        $totalProducts = Product::query()->count();

        $recentOrders = Order::query()
            ->with(['items'])
            ->latest()
            ->take(8)
            ->get();

        $lowStockProducts = Product::query()
            ->where('stock_quantity', '<=', 5)
            ->with(['brand', 'category'])
            ->take(6)
            ->get();

        $pendingOrders = Order::query()
            ->whereIn('delivery_status', ['pending', 'processing'])
            ->latest()
            ->take(6)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_sales' => (float) $totalSales,
                'total_orders' => $totalOrders,
                'total_customers' => $totalCustomers,
                'total_products' => $totalProducts,
            ],
            'recentOrders' => $recentOrders,
            'lowStockProducts' => $lowStockProducts,
            'pendingOrders' => $pendingOrders,
        ]);
    }
}
