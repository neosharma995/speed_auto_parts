<?php

namespace App\Http\Middleware;

use App\Models\Brand;
use App\Models\Category;
use App\Models\RegionalPricingRule;
use App\Models\Setting;
use App\Models\StockTransfer;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'locale' => fn () => app()->getLocale(),
            'csrf_token' => fn () => csrf_token(),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'company_name' => $user->company_name,
                    'status' => $user->status,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'roles' => $user->getRoleNames()->values()->all(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
                ] : null,
            ],
            'pendingLotsCount' => function () use ($user) {
                if (! $user || ! $user->isStaff() || ! Schema::hasTable('stock_transfers')) {
                    return 0;
                }
                return StockTransfer::where('direction', 'supplier_to_warehouse')
                    ->where('status', 'pending')
                    ->count();
            },
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'cart' => fn () => $request->session()->get('cart', []),
            'wishlistCount' => function () use ($user, $request) {
                if ($user) {
                    return Wishlist::where('user_id', $user->id)->count();
                }
                $sessionWishlist = $request->session()->get('wishlist', []);
                return count($sessionWishlist);
            },
            'activeVehicle' => fn () => $request->session()->get('active_vehicle'),
            'sessionToken' => fn () => $request->session()->getId(),
            'navCategories' => function () {
                if (!\Illuminate\Support\Facades\Schema::hasTable('categories')) {
                    return [];
                }
                return Category::where('is_active', true)
                    ->whereNull('parent_id')
                    ->orderBy('sort_order')
                    ->take(8)
                    ->get(['id', 'name', 'slug', 'image', 'translations']);
            },
            'navBrands' => function () {
                if (!\Illuminate\Support\Facades\Schema::hasTable('brands')) {
                    return [];
                }
                return Brand::where('is_active', true)
                    ->orderBy('name')
                    ->take(12)
                    ->get(['id', 'name', 'slug', 'logo', 'translations']);
            },
            'settings' => function () {
                $db = Schema::hasTable('settings')
                    ? Setting::query()->pluck('value', 'key')->toArray()
                    : [];

                $defaultRates = [
                    'AED' => 1.0,
                    'USD' => 0.2723,
                    'EUR' => 0.2510,
                ];

                $storedRates = [];
                if (! empty($db['currency_rates'])) {
                    $decoded = json_decode((string) $db['currency_rates'], true);
                    if (is_array($decoded)) {
                        foreach ($decoded as $k => $v) {
                            $upperKey = strtoupper((string) $k);
                            $num = (float) $v;
                            if ($num > 0 && array_key_exists($upperKey, $defaultRates)) {
                                $storedRates[$upperKey] = $num;
                            }
                        }
                    }
                }

                $currencyCode = strtoupper((string) ($db['currency_code'] ?? 'AED'));
                $currencySymbol = (string) ($db['currency_symbol'] ?? ($currencyCode === 'AED' ? 'د.إ' : $currencyCode));
                if ($currencyCode === 'AED' && ($currencySymbol === 'AED' || empty($currencySymbol))) {
                    $currencySymbol = 'د.إ';
                }
                $currencyLocale = (string) ($db['currency_locale'] ?? ($currencyCode === 'AED' ? 'en-AE' : 'en-US'));
                $currencyRate = (float) ($db['currency_rate'] ?? 1.0);
                if ($currencyRate <= 0) {
                    $currencyRate = 1.0;
                }

                $rates = array_merge($defaultRates, $storedRates);
                $rates[$currencyCode] = 1.0;

                return [
                    'store_name' => $db['store_name'] ?? config('app.name', 'SPEED AUTOS PARTS'),
                    'store_phone' => $db['store_phone'] ?? '+971 4 512 8900',
                    'store_email' => $db['store_email'] ?? 'support@speedautosparts.ae',
                    'store_address' => $db['store_address'] ?? 'Speed Autos Parts HQ, Al Quoz Industrial Area 3, Dubai, United Arab Emirates',
                    'currency_symbol' => $currencySymbol,
                    'currency_code' => $currencyCode,
                    'currency_locale' => $currencyLocale,
                    'currency_rate' => $currencyRate,
                    'currency_rates' => $rates,
                    'site_logo' => $db['site_logo'] ?? '/assets/images/logo/speedautoparts-official.png',
                    'header_announcement' => $db['header_announcement'] ?? 'Free UAE Delivery on Orders Over AED 500 — Dubai Express Dispatch',
                    'header_hotline_label' => $db['header_hotline_label'] ?? 'Dubai Hotline:',
                    'footer_logo' => $db['footer_logo'] ?? ($db['site_logo'] ?? '/assets/images/logo/speedautoparts-official.png'),
                    'footer_description' => $db['footer_description'] ?? 'Your trusted global source for premium automotive spare parts, performance upgrades, and genuine replacement components.',
                    'footer_hours' => $db['footer_hours'] ?? 'Mon – Sat, 9:00 AM – 7:00 PM (Dubai / GST)',
                    'footer_newsletter_eyebrow' => $db['footer_newsletter_eyebrow'] ?? 'STAY IN THE LOOP',
                    'footer_newsletter_heading' => $db['footer_newsletter_heading'] ?? 'Get Exclusive Deals & Performance Updates',
                    'footer_newsletter_desc' => $db['footer_newsletter_desc'] ?? 'Subscribe to our newsletter and be the first to know about new products, special offers, and expert automotive insights.',
                    'footer_copyright' => $db['footer_copyright'] ?? ('© ' . date('Y') . ' Speed Autos Parts. All Rights Reserved.'),
                    'social_facebook' => array_key_exists('social_facebook', $db) ? (string) $db['social_facebook'] : 'https://facebook.com',
                    'social_instagram' => array_key_exists('social_instagram', $db) ? (string) $db['social_instagram'] : 'https://instagram.com',
                    'social_youtube' => array_key_exists('social_youtube', $db) ? (string) $db['social_youtube'] : 'https://youtube.com',
                    'social_linkedin' => array_key_exists('social_linkedin', $db) ? (string) $db['social_linkedin'] : 'https://linkedin.com',
                    'social_twitter' => array_key_exists('social_twitter', $db) ? (string) $db['social_twitter'] : 'https://twitter.com',
                ];
            },
            'regionalRules' => function () {
                if (! Schema::hasTable('regional_pricing_rules')) {
                    return [];
                }

                return RegionalPricingRule::where('is_selling_enabled', true)
                    ->orderByDesc('is_default')
                    ->orderBy('country_name')
                    ->get([
                        'country_code',
                        'country_name',
                        'currency_code',
                        'margin_percent',
                        'tax_rate_percent',
                        'flat_shipping_cost',
                        'free_shipping_threshold',
                        'min_order_amount',
                        'is_selling_enabled',
                        'is_default',
                    ]);
            },
        ];
    }
}
