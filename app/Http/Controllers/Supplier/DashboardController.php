<?php

declare(strict_types=1);

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockTransfer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $supplier = $request->user();

        $totalProducts = Product::where('supplier_id', $supplier->id)->count();
        $supplierStockUnits = (int) Product::where('supplier_id', $supplier->id)->sum('supplier_stock');
        $warehouseStockUnits = (int) Product::where('supplier_id', $supplier->id)->sum('warehouse_stock');

        $pendingLotsQuery = StockTransfer::where('supplier_id', $supplier->id)
            ->where('direction', 'supplier_to_warehouse')
            ->where('status', 'pending');

        $receivedLotsQuery = StockTransfer::where('supplier_id', $supplier->id)
            ->where('direction', 'supplier_to_warehouse')
            ->where('status', 'received');

        $recentLots = StockTransfer::where('supplier_id', $supplier->id)
            ->where('direction', 'supplier_to_warehouse')
            ->with(['product', 'approver'])
            ->latest()
            ->take(10)
            ->get();

        $lowStockProducts = Product::where('supplier_id', $supplier->id)
            ->where('supplier_stock', '<=', 10)
            ->with(['brand', 'category'])
            ->orderBy('supplier_stock')
            ->take(8)
            ->get();

        return Inertia::render('Supplier/Dashboard', [
            'stats' => [
                'total_products' => $totalProducts,
                'supplier_stock_units' => $supplierStockUnits,
                'warehouse_stock_units' => $warehouseStockUnits,
                'pending_lots_count' => $pendingLotsQuery->count(),
                'pending_units' => (int) $pendingLotsQuery->sum('quantity'),
                'received_lots_count' => $receivedLotsQuery->count(),
                'received_units' => (int) $receivedLotsQuery->sum('quantity'),
            ],
            'recentLots' => $recentLots,
            'lowStockProducts' => $lowStockProducts,
        ]);
    }
}
