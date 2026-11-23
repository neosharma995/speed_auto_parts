<?php

namespace App\Http\Middleware;

use App\Models\Brand;
use App\Models\Category;
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
                    ->get(['id', 'name', 'slug', 'image']);
            },
            'navBrands' => function () {
                if (!\Illuminate\Support\Facades\Schema::hasTable('brands')) {
                    return [];
                }
                return Brand::where('is_active', true)
                    ->orderBy('name')
                    ->take(12)
                    ->get(['id', 'name', 'slug', 'logo']);
            },
            'settings' => function () {
                return [
                    'store_name' => config('app.name', 'SPEED AUTOS PARTS'),
                    'store_phone' => '+91 98765 43210',
                    'store_email' => 'support@speedautosparts.com',
                    'store_address' => 'Speed Autos Parts HQ, Performance Drive, Industrial Area, Sector 5, New Delhi 110001',
                    'currency_symbol' => '₹',
                    'currency_code' => 'INR',
                ];
            },
        ];
    }
}
