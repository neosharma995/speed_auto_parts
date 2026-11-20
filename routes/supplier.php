<?php

declare(strict_types=1);

use App\Http\Controllers\Supplier\DashboardController;
use App\Http\Controllers\Supplier\LotController;
use App\Http\Controllers\Supplier\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'supplier'])->prefix('supplier')->name('supplier.')->group(function () {
    Route::get('/', [DashboardController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::post('/products/{product}/restock', [ProductController::class, 'restock'])->name('products.restock');

    Route::get('/lots', [LotController::class, 'index'])->name('lots.index');
    Route::post('/lots', [LotController::class, 'store'])->name('lots.store');
});
