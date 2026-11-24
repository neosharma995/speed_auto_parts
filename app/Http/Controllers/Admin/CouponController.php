<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Coupon::query();

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where('code', 'like', "%{$search}%");
        }

        if ($request->filled('type')) {
            $query->where('type', (string) $request->input('type'));
        }

        if ($request->filled('status')) {
            $status = (string) $request->input('status');
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $coupons = $query
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => $coupons,
            'filters' => (object) $request->only(['search', 'type', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $payload = $this->validateCoupon($request);

        $coupon = Coupon::create($payload);

        return back()->with('success', "Coupon '{$coupon->code}' created successfully.");
    }

    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $payload = $this->validateCoupon($request, $coupon);

        $coupon->update($payload);

        return back()->with('success', "Coupon '{$coupon->code}' updated successfully.");
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $code = $coupon->code;
        $coupon->delete();

        return back()->with('success', "Coupon '{$code}' deleted.");
    }

    private function validateCoupon(Request $request, ?Coupon $coupon = null): array
    {
        if ($request->has('code')) {
            $request->merge([
                'code' => strtoupper(trim((string) $request->input('code'))),
            ]);
        }

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('coupons', 'code')->ignore($coupon?->id)],
            'type' => ['required', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'min_spend' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'usage_per_user' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ]);

        return [
            'code' => strtoupper(trim($validated['code'])),
            'type' => $validated['type'],
            'value' => $validated['value'],
            'min_spend' => isset($validated['min_spend']) && $validated['min_spend'] !== '' ? $validated['min_spend'] : 0,
            'max_discount' => $validated['type'] === 'percentage' && isset($validated['max_discount']) && $validated['max_discount'] !== ''
                ? $validated['max_discount']
                : null,
            'usage_limit' => !empty($validated['usage_limit']) ? (int) $validated['usage_limit'] : null,
            'usage_per_user' => !empty($validated['usage_per_user']) ? (int) $validated['usage_per_user'] : 1,
            'starts_at' => !empty($validated['starts_at']) ? $validated['starts_at'] : null,
            'expires_at' => !empty($validated['expires_at']) ? $validated['expires_at'] : null,
            'is_active' => array_key_exists('is_active', $validated) ? (bool) $validated['is_active'] : true,
        ];
    }
}
