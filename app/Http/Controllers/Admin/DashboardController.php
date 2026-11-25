<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\UserPermission;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user && ! $user->isAdmin() && ! $user->can(UserPermission::ViewDashboard->value)) {
            foreach (UserPermission::sidebarPermissions() as $item) {
                if ($item['name'] !== UserPermission::ViewDashboard->value && $user->can($item['name'])) {
                    return redirect($item['route']);
                }
            }
            abort(403, 'You do not have permission to access any administrative module.');
        }
        $totalSales = Order::query()
            ->where('payment_status', 'paid')
            ->sum('total_amount');

        $totalOrders = Order::query()->count();

        $totalCustomers = User::query()
            ->whereHas('roles', fn ($q) => $q->where('name', 'customer'))
            ->count();

        $totalProducts = Product::query()->count();

        $totalSuppliers = User::query()
            ->whereHas('roles', fn ($q) => $q->where('name', UserRole::Supplier->value))
            ->count();

        $pendingLotsCount = StockTransfer::query()
            ->where('direction', 'supplier_to_warehouse')
            ->where('status', 'pending')
            ->count();

        $warehouseUnits = (int) Product::query()->sum('warehouse_stock');

        $pendingLots = StockTransfer::query()
            ->where('direction', 'supplier_to_warehouse')
            ->where('status', 'pending')
            ->with(['product', 'supplier'])
            ->latest()
            ->take(5)
            ->get();

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
                'total_suppliers' => $totalSuppliers,
                'pending_lots' => $pendingLotsCount,
                'warehouse_units' => $warehouseUnits,
            ],
            'recentOrders' => $recentOrders,
            'lowStockProducts' => $lowStockProducts,
            'pendingOrders' => $pendingOrders,
            'pendingLots' => $pendingLots,
        ]);
    }
}
