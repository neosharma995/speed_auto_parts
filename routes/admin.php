<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\AttributeController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CatalogueController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\RegionalPricingController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SubscriberController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\SupplierOfferController;
use App\Http\Controllers\Admin\TaxController;
use App\Http\Controllers\Admin\VehicleController;
use App\Http\Controllers\Admin\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'staff'])->prefix('admin')->name('admin.')->group(function () {
    // Admin Dashboard (handles automatic redirect to first permitted sidebar module when needed)
    Route::get('/', [DashboardController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin Profile & Security (accessible to all authenticated staff)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    // Orders Management
    Route::middleware('role_or_permission:admin|manage orders')->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::put('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    });

    // Supply Chain: Suppliers Management, Offers Comparison, Catalog Import & B2B Connectors
    Route::middleware('role_or_permission:admin|manage suppliers')->group(function () {
        Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
        Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
        Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');
        Route::post('/suppliers/{supplier}/approve', [SupplierController::class, 'approve'])->name('suppliers.approve');
        Route::post('/suppliers/{supplier}/reject', [SupplierController::class, 'reject'])->name('suppliers.reject');
        Route::post('/suppliers/{supplier}/documents', [SupplierController::class, 'uploadDocument'])->name('suppliers.documents.store');
        Route::delete('/suppliers/documents/{document}', [SupplierController::class, 'deleteDocument'])->name('suppliers.documents.destroy');

        // Multi-Supplier Offers, Auto-Selection Rules & Manual Override
        Route::post('/suppliers/offers', [SupplierOfferController::class, 'store'])->name('suppliers.offers.store');
        Route::delete('/suppliers/offers/{offer}', [SupplierOfferController::class, 'destroy'])->name('suppliers.offers.destroy');
        Route::post('/suppliers/selection-rules', [SupplierOfferController::class, 'saveRules'])->name('suppliers.selection-rules.save');
        Route::post('/suppliers/offers/{product}/{offer}/override', [SupplierOfferController::class, 'override'])->name('suppliers.offers.override');
        Route::post('/suppliers/offers/{product}/clear-override', [SupplierOfferController::class, 'clearOverride'])->name('suppliers.offers.clear-override');

        // Catalog Import (CSV, XML, Excel)
        Route::post('/suppliers/import', [SupplierOfferController::class, 'import'])->name('suppliers.import');
        Route::get('/suppliers/import-template/{format}', [SupplierOfferController::class, 'downloadTemplate'])->name('suppliers.import-template');

        // Supplier B2B API Connectors
        Route::post('/suppliers/connectors', [SupplierOfferController::class, 'storeConnector'])->name('suppliers.connectors.store');
        Route::delete('/suppliers/connectors/{connector}', [SupplierOfferController::class, 'destroyConnector'])->name('suppliers.connectors.destroy');
        Route::post('/suppliers/connectors/{connector}/test', [SupplierOfferController::class, 'testConnector'])->name('suppliers.connectors.test');
        Route::post('/suppliers/connectors/{connector}/sync', [SupplierOfferController::class, 'syncConnector'])->name('suppliers.connectors.sync');
    });

    // Supply Chain: Shared Supplier Incoming Lots & Warehouse Logs
    Route::middleware('role_or_permission:admin|manage warehouse|manage suppliers')->group(function () {
        Route::get('/warehouse/incoming', [WarehouseController::class, 'incoming'])->name('warehouse.incoming');
        Route::get('/warehouse/logs', [WarehouseController::class, 'logs'])->name('warehouse.logs');
        Route::post('/warehouse/lots/{transfer}/receive', [WarehouseController::class, 'receiveLot'])->name('warehouse.lots.receive');
        Route::post('/warehouse/lots/{transfer}/reject', [WarehouseController::class, 'rejectLot'])->name('warehouse.lots.reject');
        Route::post('/warehouse/lot-number/{lotNumber}/receive', [WarehouseController::class, 'receiveLotBatch'])->name('warehouse.lot-batch.receive');
        Route::post('/warehouse/lot-number/{lotNumber}/reject', [WarehouseController::class, 'rejectLotBatch'])->name('warehouse.lot-batch.reject');
    });

    // Supply Chain: Admin Warehouse Stock Management
    Route::middleware('role_or_permission:admin|manage warehouse')->group(function () {
        Route::get('/warehouse', [WarehouseController::class, 'index'])->name('warehouse.index');
        Route::post('/warehouse/products/{product}/adjust', [WarehouseController::class, 'adjustStock'])->name('warehouse.products.adjust');
    });

    // Supply Chain: Shared Warehouse -> Catalogue Push Actions
    Route::middleware('role_or_permission:admin|manage catalogue|manage warehouse')->group(function () {
        Route::post('/catalogue/bulk-transfer', [CatalogueController::class, 'bulkTransferFromWarehouse'])->name('catalogue.bulk-transfer');
        Route::post('/catalogue/{product}/transfer', [CatalogueController::class, 'transferFromWarehouse'])->name('catalogue.transfer');
    });

    // Supply Chain: Website Catalogue & Pricing
    Route::middleware('role_or_permission:admin|manage catalogue')->group(function () {
        Route::get('/catalogue', [CatalogueController::class, 'index'])->name('catalogue.index');
        Route::get('/catalogue/logs', [CatalogueController::class, 'logs'])->name('catalogue.logs');
        Route::post('/catalogue/{product}/return', [CatalogueController::class, 'returnToWarehouse'])->name('catalogue.return');
        Route::post('/catalogue/{product}/toggle-status', [CatalogueController::class, 'toggleStatus'])->name('catalogue.toggle-status');
        Route::post('/catalogue/{product}/price', [CatalogueController::class, 'updatePrice'])->name('catalogue.update-price');
    });

    // Products Catalog & Inline Attributes Management
    Route::middleware('role_or_permission:admin|manage products')->group(function () {
        Route::resource('products', ProductController::class);
        Route::get('/attributes', [AttributeController::class, 'index'])->name('attributes.index');
        Route::post('/attributes', [AttributeController::class, 'store'])->name('attributes.store');
        Route::delete('/attributes/{attribute}', [AttributeController::class, 'destroy'])->name('attributes.destroy');
    });

    // Categories Management
    Route::middleware('role_or_permission:admin|manage categories')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    });

    // Brands Management
    Route::middleware('role_or_permission:admin|manage brands')->group(function () {
        Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
        Route::post('/brands', [BrandController::class, 'store'])->name('brands.store');
        Route::put('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
        Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');
    });

    // Vehicle Fitment Database Management
    Route::middleware('role_or_permission:admin|manage vehicles')->group(function () {
        Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
        Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
        Route::put('/vehicles/{vehicle}', [VehicleController::class, 'update'])->name('vehicles.update');
        Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');
    });

    // Customers Directory & Newsletter Subscribers
    Route::middleware('role_or_permission:admin|manage customers')->group(function () {
        Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::get('/subscribers', [SubscriberController::class, 'index'])->name('subscribers.index');
        Route::post('/subscribers', [SubscriberController::class, 'store'])->name('subscribers.store');
        Route::post('/subscribers/{subscriber}/toggle-status', [SubscriberController::class, 'toggleStatus'])->name('subscribers.toggle-status');
        Route::get('/subscribers/export', [SubscriberController::class, 'export'])->name('subscribers.export');
        Route::delete('/subscribers/{subscriber}', [SubscriberController::class, 'destroy'])->name('subscribers.destroy');
    });

    // Coupons & Promotional Discounts
    Route::middleware('role_or_permission:admin|manage coupons')->group(function () {
        Route::get('/coupons', [CouponController::class, 'index'])->name('coupons.index');
        Route::post('/coupons', [CouponController::class, 'store'])->name('coupons.store');
        Route::put('/coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
        Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');
    });

    // Reviews Moderation
    Route::middleware('role_or_permission:admin|manage reviews')->group(function () {
        Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
        Route::post('/reviews/{review}/toggle-approve', [ReviewController::class, 'toggleApprove'])->name('reviews.toggle-approve');
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
    });

    // Roles, Sidebar Permissions & Staff Access Control
    Route::middleware('role_or_permission:admin|manage roles')->group(function () {
        Route::get('/roles', [RolePermissionController::class, 'index'])->name('roles.index');
        Route::post('/roles', [RolePermissionController::class, 'storeRole'])->name('roles.store');
        Route::put('/roles/{role}', [RolePermissionController::class, 'updateRole'])->name('roles.update');
        Route::delete('/roles/{role}', [RolePermissionController::class, 'destroyRole'])->name('roles.destroy');

        Route::post('/roles/staff', [RolePermissionController::class, 'storeStaff'])->name('roles.staff.store');
        Route::put('/roles/staff/{staff}', [RolePermissionController::class, 'updateStaff'])->name('roles.staff.update');
        Route::delete('/roles/staff/{staff}', [RolePermissionController::class, 'destroyStaff'])->name('roles.staff.destroy');
    });

    // Store, UAE VAT Tax & Regional Pricing Settings
    Route::middleware('role_or_permission:admin|manage settings')->group(function () {
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingController::class, 'store'])->name('settings.store');
        Route::get('/taxes', [TaxController::class, 'index'])->name('taxes.index');
        Route::post('/taxes', [TaxController::class, 'store'])->name('taxes.store');
        Route::post('/regional-pricing', [RegionalPricingController::class, 'store'])->name('regional-pricing.store');
        Route::put('/regional-pricing/{rule}', [RegionalPricingController::class, 'update'])->name('regional-pricing.update');
        Route::delete('/regional-pricing/{rule}', [RegionalPricingController::class, 'destroy'])->name('regional-pricing.destroy');
    });
});
