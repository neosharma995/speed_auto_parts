<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;

class TaxCalculationService
{
    protected string $storeEmirate = 'Dubai';
    protected float $defaultRatePercent = 5.00;

    /**
     * Calculate UAE VAT (5% standard rate) for an order based on items and product tax classes.
     *
     * @param  array<array{productId?: int|string, price: float|int, quantity: int}>  $items
     * @param  string  $customerEmirate
     * @return array{
     *     tax_amount: float,
     *     vat_amount: float,
     *     cgst_amount: float,
     *     sgst_amount: float,
     *     igst_amount: float,
     *     tax_rate_percent: float,
     *     is_interstate: bool,
     *     breakdown: array
     * }
     */
    public function calculate(array $items, string $customerEmirate = 'Dubai'): array
    {
        $totalTax = 0.00;
        $breakdown = [];

        foreach ($items as $item) {
            $price = (float) ($item['price'] ?? 0);
            $qty = (int) ($item['quantity'] ?? 1);
            $lineTotal = $price * $qty;

            $taxRatePercent = $this->defaultRatePercent;

            $productId = $item['productId'] ?? $item['product_id'] ?? null;
            if ($productId) {
                $product = Product::with('taxClass.rates')->find($productId);
                if ($product && $product->taxClass && $product->taxClass->rates->isNotEmpty()) {
                    $activeRate = $product->taxClass->rates->firstWhere('is_active', true) ?? $product->taxClass->rates->first();
                    if ($activeRate) {
                        $taxRatePercent = (float) $activeRate->rate;
                    }
                }
            }

            $itemTax = round(($lineTotal * $taxRatePercent) / 100, 2);
            $totalTax += $itemTax;

            $breakdown[] = [
                'name' => $item['name'] ?? 'Automotive Part',
                'line_total' => $lineTotal,
                'rate_percent' => $taxRatePercent,
                'tax_amount' => $itemTax,
            ];
        }

        $roundedTax = round($totalTax, 2);

        return [
            'tax_amount' => $roundedTax,
            'vat_amount' => $roundedTax,
            'cgst_amount' => 0.00,
            'sgst_amount' => 0.00,
            'igst_amount' => 0.00,
            'tax_rate_percent' => $this->defaultRatePercent,
            'is_interstate' => false,
            'breakdown' => $breakdown,
        ];
    }
}
