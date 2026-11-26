<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RegionalPricingRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RegionalPricingController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'country_code' => ['required', 'string', 'max:5'],
            'country_name' => ['required', 'string', 'max:100'],
            'currency_code' => ['required', 'in:AED,USD,EUR'],
            'margin_percent' => ['required', 'numeric', 'min:-50', 'max:200'],
            'tax_rate_percent' => ['required', 'numeric', 'min:0', 'max:50'],
            'flat_shipping_cost' => ['required', 'numeric', 'min:0'],
            'free_shipping_threshold' => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'is_selling_enabled' => ['boolean'],
            'is_default' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $code = strtoupper(trim($validated['country_code']));

        if (! empty($validated['is_default'])) {
            RegionalPricingRule::query()->update(['is_default' => false]);
        }

        RegionalPricingRule::updateOrCreate(
            ['country_code' => $code],
            [
                'country_name' => $validated['country_name'],
                'currency_code' => strtoupper($validated['currency_code']),
                'margin_percent' => $validated['margin_percent'],
                'tax_rate_percent' => $validated['tax_rate_percent'],
                'flat_shipping_cost' => $validated['flat_shipping_cost'],
                'free_shipping_threshold' => $validated['free_shipping_threshold'],
                'min_order_amount' => $validated['min_order_amount'] ?? 0,
                'is_selling_enabled' => $validated['is_selling_enabled'] ?? true,
                'is_default' => (bool) ($validated['is_default'] ?? false),
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return back()->with('success', "Regional pricing rule for {$validated['country_name']} ({$code}) saved.");
    }

    public function update(Request $request, RegionalPricingRule $rule): RedirectResponse
    {
        $validated = $request->validate([
            'country_name' => ['required', 'string', 'max:100'],
            'currency_code' => ['required', 'in:AED,USD,EUR'],
            'margin_percent' => ['required', 'numeric', 'min:-50', 'max:200'],
            'tax_rate_percent' => ['required', 'numeric', 'min:0', 'max:50'],
            'flat_shipping_cost' => ['required', 'numeric', 'min:0'],
            'free_shipping_threshold' => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'is_selling_enabled' => ['boolean'],
            'is_default' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        if (! empty($validated['is_default'])) {
            RegionalPricingRule::where('id', '!=', $rule->id)->update(['is_default' => false]);
        }

        $rule->update([
            'country_name' => $validated['country_name'],
            'currency_code' => strtoupper($validated['currency_code']),
            'margin_percent' => $validated['margin_percent'],
            'tax_rate_percent' => $validated['tax_rate_percent'],
            'flat_shipping_cost' => $validated['flat_shipping_cost'],
            'free_shipping_threshold' => $validated['free_shipping_threshold'],
            'min_order_amount' => $validated['min_order_amount'] ?? 0,
            'is_selling_enabled' => $validated['is_selling_enabled'] ?? true,
            'is_default' => (bool) ($validated['is_default'] ?? false),
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', "Updated regional rule for {$rule->country_name}.");
    }

    public function destroy(RegionalPricingRule $rule): RedirectResponse
    {
        $name = $rule->country_name;
        $rule->delete();

        return back()->with('success', "Deleted regional rule for {$name}.");
    }
}
