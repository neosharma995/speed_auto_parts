<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CustomerAccountController extends Controller
{
    public function dashboard(): Response
    {
        $user = Auth::user();

        $recentOrders = Order::query()
            ->where('user_id', $user->id)
            ->with(['items'])
            ->latest()
            ->take(5)
            ->get();

        $ordersCount = Order::query()->where('user_id', $user->id)->count();

        $defaultAddress = CustomerAddress::query()
            ->where('user_id', $user->id)
            ->where('is_default', true)
            ->first();

        $wishlistCount = Wishlist::query()->where('user_id', $user->id)->count();

        return Inertia::render('Customer/Dashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'created_at' => $user->created_at->format('M d, Y'),
            ],
            'recentOrders' => $recentOrders,
            'ordersCount' => $ordersCount,
            'defaultAddress' => $defaultAddress,
            'wishlistCount' => $wishlistCount,
        ]);
    }

    public function orders(): Response
    {
        $user = Auth::user();

        $orders = Order::query()
            ->where('user_id', $user->id)
            ->with(['items'])
            ->latest()
            ->get();

        return Inertia::render('Customer/Orders', [
            'orders' => $orders,
        ]);
    }

    public function addresses(): Response
    {
        $user = Auth::user();

        $addresses = CustomerAddress::query()
            ->where('user_id', $user->id)
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return Inertia::render('Customer/Addresses', [
            'addresses' => $addresses,
        ]);
    }

    public function storeAddress(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:25'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'pincode' => ['required', 'string', 'max:20'],
            'is_default' => ['boolean'],
        ]);

        $user = Auth::user();

        if (!empty($validated['is_default'])) {
            CustomerAddress::query()
                ->where('user_id', $user->id)
                ->update(['is_default' => false]);
        } else {
            // If this is user's first address, make it default
            $hasAddress = CustomerAddress::query()->where('user_id', $user->id)->exists();
            if (!$hasAddress) {
                $validated['is_default'] = true;
            }
        }

        $validated['user_id'] = $user->id;
        $validated['type'] = 'shipping';
        $validated['country'] = 'India';

        CustomerAddress::create($validated);

        return back()->with('success', 'Address added successfully.');
    }

    public function deleteAddress(CustomerAddress $address): RedirectResponse
    {
        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        $wasDefault = $address->is_default;
        $address->delete();

        if ($wasDefault) {
            $next = CustomerAddress::query()->where('user_id', Auth::id())->first();
            if ($next) {
                $next->update(['is_default' => true]);
            }
        }

        return back()->with('success', 'Address removed successfully.');
    }

    public function setDefaultAddress(CustomerAddress $address): RedirectResponse
    {
        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        CustomerAddress::query()
            ->where('user_id', Auth::id())
            ->update(['is_default' => false]);

        $address->update(['is_default' => true]);

        return back()->with('success', 'Default address updated.');
    }

    public function wishlist(): Response
    {
        $user = Auth::user();

        $wishlistItems = Wishlist::query()
            ->where('user_id', $user->id)
            ->with(['product.brand', 'product.category', 'variation'])
            ->latest()
            ->get();

        return Inertia::render('Customer/Wishlist', [
            'wishlistItems' => $wishlistItems,
        ]);
    }

    public function toggleWishlist(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'product_variation_id' => ['nullable', 'exists:product_variations,id'],
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please sign in to save items to your wishlist.',
            ], 401);
        }

        $existing = Wishlist::query()
            ->where('user_id', $user->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'success' => true,
                'inWishlist' => false,
                'message' => 'Removed from wishlist.',
            ]);
        }

        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $validated['product_id'],
            'product_variation_id' => $validated['product_variation_id'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'inWishlist' => true,
            'message' => 'Added to wishlist.',
        ]);
    }
}
