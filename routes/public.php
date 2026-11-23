<?php

declare(strict_types=1);

use App\Http\Controllers\Public\CartController;
use App\Http\Controllers\Public\CheckoutController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\ProductController;
use App\Http\Controllers\Public\ShopController;
use App\Http\Controllers\Public\StaticPageController;
use App\Http\Controllers\Public\VehicleFinderController;
use Illuminate\Support\Facades\Route;

// Public Storefront
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/shop', [ShopController::class, 'index'])->name('shop');
Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('/categories', [StaticPageController::class, 'categories'])->name('categories.index');
Route::get('/brands', [StaticPageController::class, 'brands'])->name('brands.index');
Route::get('/vehicle-finder', [VehicleFinderController::class, 'page'])->name('vehicle-finder');
Route::post('/vehicles/select', [VehicleFinderController::class, 'selectVehicle'])->name('vehicles.select');
Route::post('/vehicles/clear', [VehicleFinderController::class, 'clearVehicle'])->name('vehicles.clear');
Route::get('/track-order', [StaticPageController::class, 'trackOrder'])->name('track-order');
Route::get('/order-success/{orderNumber}', [CheckoutController::class, 'success'])->name('order.success');

// Static Pages
Route::get('/about', [StaticPageController::class, 'about'])->name('about');
Route::get('/contact', [StaticPageController::class, 'contact'])->name('contact');
Route::get('/contact-us', [StaticPageController::class, 'contact'])->name('contact-us');
Route::get('/help-center', [StaticPageController::class, 'helpCenter'])->name('help-center');
Route::get('/faqs', [StaticPageController::class, 'faqs'])->name('faqs');
Route::get('/shipping-policy', [StaticPageController::class, 'shippingPolicy'])->name('shipping-policy');
Route::get('/return-policy', [StaticPageController::class, 'returnPolicy'])->name('return-policy');
Route::get('/privacy-policy', [StaticPageController::class, 'privacyPolicy'])->name('privacy-policy');
Route::get('/terms', [StaticPageController::class, 'terms'])->name('terms');
Route::get('/terms-of-service', [StaticPageController::class, 'terms'])->name('terms-of-service');

// Cart Routes
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/sync', [CartController::class, 'sync'])->name('cart.sync');
Route::post('/cart/clear', [CartController::class, 'clear'])->name('cart.clear_alt');
Route::post('/api/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::post('/api/cart/update', [CartController::class, 'update'])->name('cart.update');
Route::post('/api/cart/remove', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/api/cart/clear', [CartController::class, 'clear'])->name('cart.clear');

// Checkout Routes
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/api/coupons/validate', [CheckoutController::class, 'validateCoupon'])->name('coupons.validate');
Route::post('/api/checkout/apply-coupon', [CheckoutController::class, 'validateCoupon'])->name('checkout.apply-coupon');
Route::post('/checkout/cod', [CheckoutController::class, 'placeCodOrder'])->name('checkout.cod');
Route::post('/checkout/razorpay-init', [CheckoutController::class, 'createRazorpayOrder'])->name('checkout.razorpay-init');
Route::post('/checkout/verify-payment', [CheckoutController::class, 'verifyPayment'])->name('checkout.verify-payment');
Route::post('/checkout/process', [CheckoutController::class, 'process'])->name('checkout.process');
Route::post('/checkout/razorpay/verify', [CheckoutController::class, 'verifyPayment'])->name('checkout.razorpay.verify');

// Vehicle Cascading APIs
Route::prefix('api/vehicles')->group(function () {
    Route::get('/years', [VehicleFinderController::class, 'getYears']);
    Route::get('/makes', [VehicleFinderController::class, 'getMakes']);
    Route::get('/models', [VehicleFinderController::class, 'getModels']);
    Route::get('/engines', [VehicleFinderController::class, 'getEngines']);
});

// Order Tracking API
Route::get('/api/orders/track', [StaticPageController::class, 'trackOrderApi']);
