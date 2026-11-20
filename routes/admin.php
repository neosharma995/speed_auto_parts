<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\AttributeController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CatalogueController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\TaxController;
use App\Http\Controllers\Admin\VehicleController;
use App\Http\Controllers\Admin\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'staff'])->prefix('admin')->name('admin.')->group(function () {
    // Admin Dashboard
    Route::get('/', [DashboardController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Products Catalog Management
    Route::resource('products', ProductController::class);

    // Orders Management
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::put('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');

    // Categories Management
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Brands Management
    Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
    Route::post('/brands', [BrandController::class, 'store'])->name('brands.store');
    Route::put('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
    Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');

    // Dynamic Attributes Management
    Route::get('/attributes', [AttributeController::class, 'index'])->name('attributes.index');
    Route::post('/attributes', [AttributeController::class, 'store'])->name('attributes.store');
    Route::delete('/attributes/{attribute}', [AttributeController::class, 'destroy'])->name('attributes.destroy');

    // Vehicle Fitment Database Management
    Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
    Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
    Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');

    // Inventory Management
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory/{product}/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');

    // Indian GST & Tax Classes
    Route::get('/taxes', [TaxController::class, 'index'])->name('taxes.index');
    Route::post('/taxes', [TaxController::class, 'store'])->name('taxes.store');

    // Coupons & Promotional Discounts
    Route::get('/coupons', [CouponController::class, 'index'])->name('coupons.index');
    Route::post('/coupons', [CouponController::class, 'store'])->name('coupons.store');
    Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');

    // Customers Directory
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');

    // Reviews Moderation
    Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
    Route::post('/reviews/{review}/toggle-approve', [ReviewController::class, 'toggleApprove'])->name('reviews.toggle-approve');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');

    // Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'store'])->name('settings.store');

    // Supply Chain: Suppliers Management
    Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
    Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

    // Supply Chain: Admin Warehouse (Receive/Reject Supplier Lots & Stock)
    Route::get('/warehouse', [WarehouseController::class, 'index'])->name('warehouse.index');
    Route::post('/warehouse/lots/{transfer}/receive', [WarehouseController::class, 'receiveLot'])->name('warehouse.lots.receive');
    Route::post('/warehouse/lots/{transfer}/reject', [WarehouseController::class, 'rejectLot'])->name('warehouse.lots.reject');
    Route::post('/warehouse/lot-number/{lotNumber}/receive', [WarehouseController::class, 'receiveLotBatch'])->name('warehouse.lot-batch.receive');
    Route::post('/warehouse/lot-number/{lotNumber}/reject', [WarehouseController::class, 'rejectLotBatch'])->name('warehouse.lot-batch.reject');
    Route::post('/warehouse/products/{product}/adjust', [WarehouseController::class, 'adjustStock'])->name('warehouse.products.adjust');

    // Supply Chain: Website Catalogue (Transfer from Warehouse & Set Selling Price)
    Route::get('/catalogue', [CatalogueController::class, 'index'])->name('catalogue.index');
    Route::post('/catalogue/bulk-transfer', [CatalogueController::class, 'bulkTransferFromWarehouse'])->name('catalogue.bulk-transfer');
    Route::post('/catalogue/{product}/transfer', [CatalogueController::class, 'transferFromWarehouse'])->name('catalogue.transfer');
    Route::post('/catalogue/{product}/return', [CatalogueController::class, 'returnToWarehouse'])->name('catalogue.return');
    Route::post('/catalogue/{product}/toggle-status', [CatalogueController::class, 'toggleStatus'])->name('catalogue.toggle-status');
    Route::post('/catalogue/{product}/price', [CatalogueController::class, 'updatePrice'])->name('catalogue.update-price');
});
