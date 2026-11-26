<?php

declare(strict_types=1);

use App\Http\Controllers\Public\CartController;
use App\Http\Controllers\Public\CheckoutController;
use App\Http\Controllers\Public\CustomerAccountController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\NewsletterController;
use App\Http\Controllers\Public\ProductController;
use App\Http\Controllers\Public\ShopController;
use App\Http\Controllers\Public\StaticPageController;
use App\Http\Controllers\Public\VehicleFinderController;
use App\Http\Middleware\SetLocaleFromUrl;
use Illuminate\Support\Facades\Route;

$registerLocalizedStorefrontPages = function (bool $named): void {
    $name = fn (string $routeName): ?string => $named ? $routeName : null;

    $add = function (string $uri, array|callable $action, ?string $routeName = null) use ($name) {
        $route = Route::get($uri, $action);
        if ($routeName && ($resolved = $name($routeName))) {
            $route->name($resolved);
        }
        return $route;
    };

    $add('/', [HomeController::class, 'index'], 'home');
    $add('/shop', [ShopController::class, 'index'], 'shop');
    $add('/products', [ShopController::class, 'index'], 'products');
    $add('/products/{slug}', [ProductController::class, 'show'], 'products.show');
    $add('/product/{slug}', [ProductController::class, 'show'], 'product.show');
    $add('/categories', [StaticPageController::class, 'categories'], 'categories.index');
    $add('/brands', [StaticPageController::class, 'brands'], 'brands.index');
    Route::get('/brands/{slug}', function (string $slug) {
        $prefix = app()->getLocale() === 'en' ? '' : '/' . app()->getLocale();
        return redirect($prefix . '/shop?brand=' . urlencode($slug));
    });
    Route::get('/category/{slug}', function (string $slug) {
        $prefix = app()->getLocale() === 'en' ? '' : '/' . app()->getLocale();
        return redirect($prefix . '/shop?category=' . urlencode($slug));
    });
    $add('/vehicle-finder', [VehicleFinderController::class, 'page'], 'vehicle-finder');
    $add('/track-order', [StaticPageController::class, 'trackOrder'], 'track-order');
    $add('/order-success/{orderNumber}', [CheckoutController::class, 'success'], 'order.success');

    // Static Pages
    $add('/about-us', [StaticPageController::class, 'about'], 'about');
    Route::redirect('/about', '/about-us');
    $add('/contact-us', [StaticPageController::class, 'contact'], 'contact');
    Route::redirect('/contact', '/contact-us');
    $add('/shipping-delivery', [StaticPageController::class, 'shippingPolicy'], 'shipping.delivery');
    $add('/shipping-policy', [StaticPageController::class, 'shippingPolicy'], 'shipping-policy');
    $add('/return-policy', [StaticPageController::class, 'returnPolicy'], 'return-policy');
    $add('/returns-refunds', [StaticPageController::class, 'returnPolicy'], 'returns.refunds');
    $add('/privacy-policy', [StaticPageController::class, 'privacyPolicy'], 'privacy-policy');
    $add('/terms-and-conditions', [StaticPageController::class, 'terms'], 'terms.conditions');
    $add('/terms', [StaticPageController::class, 'terms'], 'terms');
    $add('/help-center', [StaticPageController::class, 'helpCenter'], 'help-center');
    $add('/faqs', [StaticPageController::class, 'faqs'], 'faqs');
    $add('/404', [StaticPageController::class, 'notFound'], 'not-found');

    // Cart & Checkout Pages
    $add('/cart', [CartController::class, 'index'], 'cart.index');
    $add('/checkout', [CheckoutController::class, 'index'], 'checkout.index');

    // Customer Portal Pages (Authenticated)
    Route::middleware(['auth'])->group(function () use ($add) {
        $add('/customer/dashboard', [CustomerAccountController::class, 'dashboard'], 'customer.dashboard');
        $add('/customer/orders', [CustomerAccountController::class, 'orders'], 'customer.orders');
        $add('/customer/addresses', [CustomerAccountController::class, 'addresses'], 'customer.addresses');
        $add('/customer/wishlist', [CustomerAccountController::class, 'wishlist'], 'customer.wishlist');
    });
};

// Default English Storefront (unprefixed: /, /shop, /products/...)
$registerLocalizedStorefrontPages(true);

// Localized Storefront URL Prefixes (/ar, /ar/shop, /fr, /fr/shop, ...)
Route::prefix('{locale}')
    ->where(['locale' => 'ar|fr'])
    ->middleware(SetLocaleFromUrl::class)
    ->group(function () use ($registerLocalizedStorefrontPages) {
        $registerLocalizedStorefrontPages(false);
    });

// Public Storefront APIs & Actions (locale-agnostic)
Route::get('/api/search/suggestions', [ShopController::class, 'suggestions'])->name('api.search.suggestions');
Route::post('/vehicles/select', [VehicleFinderController::class, 'selectVehicle'])->name('vehicles.select');
Route::post('/vehicles/clear', [VehicleFinderController::class, 'clearVehicle'])->name('vehicles.clear');

// Cart Actions
Route::post('/cart/sync', [CartController::class, 'sync'])->name('cart.sync');
Route::post('/cart/clear', [CartController::class, 'clear'])->name('cart.clear_alt');
Route::post('/api/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::post('/api/cart/update', [CartController::class, 'update'])->name('cart.update');
Route::post('/api/cart/remove', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/api/cart/clear', [CartController::class, 'clear'])->name('cart.clear');

// Checkout Actions & Stripe
Route::post('/api/checkout/calculate-tax', [CheckoutController::class, 'calculateTax'])->name('checkout.calculate-tax');
Route::post('/api/coupons/validate', [CheckoutController::class, 'validateCoupon'])->name('coupons.validate');
Route::post('/api/checkout/apply-coupon', [CheckoutController::class, 'validateCoupon'])->name('checkout.apply-coupon');
Route::post('/checkout/cod', [CheckoutController::class, 'placeCodOrder'])->name('checkout.cod');
Route::post('/checkout/process', [CheckoutController::class, 'process'])->name('checkout.process');
Route::post('/checkout/stripe-session', [CheckoutController::class, 'createStripeSession'])->name('checkout.stripe-session');
Route::get('/checkout/stripe/success', [CheckoutController::class, 'stripeSuccess'])->name('checkout.stripe.success');
Route::get('/checkout/stripe/cancel', [CheckoutController::class, 'stripeCancel'])->name('checkout.stripe.cancel');
Route::post('/stripe/webhook', [CheckoutController::class, 'stripeWebhook'])->name('stripe.webhook');

// Vehicle Cascading APIs
Route::prefix('api/vehicles')->group(function () {
    Route::get('/years', [VehicleFinderController::class, 'getYears']);
    Route::get('/makes', [VehicleFinderController::class, 'getMakes']);
    Route::get('/models', [VehicleFinderController::class, 'getModels']);
    Route::get('/engines', [VehicleFinderController::class, 'getEngines']);
});

// Order Tracking API & Newsletter Subscription
Route::get('/api/orders/track', [StaticPageController::class, 'trackOrderApi']);
Route::post('/api/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');

// Customer Portal Mutations (Authenticated)
Route::middleware(['auth'])->group(function () {
    Route::post('/customer/addresses', [CustomerAccountController::class, 'storeAddress'])->name('customer.addresses.store');
    Route::delete('/customer/addresses/{address}', [CustomerAccountController::class, 'deleteAddress'])->name('customer.addresses.delete');
    Route::post('/customer/addresses/{address}/default', [CustomerAccountController::class, 'setDefaultAddress'])->name('customer.addresses.default');
    Route::post('/api/wishlist/toggle', [CustomerAccountController::class, 'toggleWishlist'])->name('wishlist.toggle');
});

Route::fallback([StaticPageController::class, 'notFound']);
