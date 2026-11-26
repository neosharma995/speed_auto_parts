<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\RegionalPricingRule;
use Illuminate\Support\Facades\Schema;

class RegionalPricingService
{
    public function resolveRule(?string $countryCode = null): ?RegionalPricingRule
    {
        if (! Schema::hasTable('regional_pricing_rules')) {
            return null;
        }

        if ($countryCode) {
            $code = strtoupper(trim($countryCode));
            $rule = RegionalPricingRule::where('country_code', $code)->first();
            if ($rule) {
                return $rule;
            }
        }

        return RegionalPricingRule::where('is_default', true)->first()
            ?? RegionalPricingRule::where('country_code', 'AE')->first()
            ?? RegionalPricingRule::first();
    }

    /**
     * Apply regional margin adjustment to a base selling price.
     */
    public function applyRegionalMargin(float $basePrice, ?RegionalPricingRule $rule): float
    {
        if (! $rule) {
            return round($basePrice, 2);
        }

        $margin = (float) $rule->margin_percent;
        if (abs($margin) < 0.0001) {
            return round($basePrice, 2);
        }

        return round($basePrice * (1 + ($margin / 100)), 2);
    }

    /**
     * Calculate country-specific shipping cost and tax amount for a subtotal.
     *
     * @return array{
     *     country_code: string,
     *     country_name: string,
     *     currency_code: string,
     *     margin_percent: float,
     *     tax_rate_percent: float,
     *     tax_amount: float,
     *     shipping_cost: float,
     *     free_shipping_threshold: float,
     *     min_order_amount: float,
     *     is_selling_enabled: bool
     * }
     */
    public function calculateForCountry(float $subtotal, ?string $countryCode = 'AE'): array
    {
        $rule = $this->resolveRule($countryCode);

        if (! $rule) {
            $tax = round($subtotal * 0.05, 2);

            return [
                'country_code' => 'AE',
                'country_name' => 'United Arab Emirates',
                'currency_code' => 'AED',
                'margin_percent' => 0.0,
                'tax_rate_percent' => 5.0,
                'tax_amount' => $tax,
                'shipping_cost' => 0.0,
                'free_shipping_threshold' => 500.0,
                'min_order_amount' => 0.0,
                'is_selling_enabled' => true,
            ];
        }

        $taxRate = (float) $rule->tax_rate_percent;
        $taxAmount = round(($subtotal * $taxRate) / 100, 2);

        $freeThreshold = (float) $rule->free_shipping_threshold;
        $flatShipping = (float) $rule->flat_shipping_cost;
        $shippingCost = ($freeThreshold > 0 && $subtotal >= $freeThreshold) ? 0.0 : $flatShipping;

        return [
            'country_code' => $rule->country_code,
            'country_name' => $rule->country_name,
            'currency_code' => $rule->currency_code,
            'margin_percent' => (float) $rule->margin_percent,
            'tax_rate_percent' => $taxRate,
            'tax_amount' => $taxAmount,
            'shipping_cost' => round($shippingCost, 2),
            'free_shipping_threshold' => $freeThreshold,
            'min_order_amount' => (float) $rule->min_order_amount,
            'is_selling_enabled' => (bool) $rule->is_selling_enabled,
        ];
    }
}
