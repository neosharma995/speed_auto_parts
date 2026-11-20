<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;
use App\Models\TaxRate;

class TaxCalculationService
{
    protected string $storeState = 'Delhi';
    protected float $defaultRatePercent = 18.00;

    /**
     * Calculate tax for an order based on items, subtotal, and customer shipping state.
     *
     * @param  array<array{productId?: int|string, price: float|int, quantity: int}>  $items
     * @param  string  $customerState
     * @return array{
     *     tax_amount: float,
     *     cgst_amount: float,
     *     sgst_amount: float,
     *     igst_amount: float,
     *     tax_rate_percent: float,
     *     breakdown: array
     * }
     */
    public function calculate(array $items, string $customerState = 'Delhi'): array
    {
        $isSameState = strcasecmp(trim($customerState), $this->storeState) === 0;

        $totalTax = 0.00;
        $totalCgst = 0.00;
        $totalSgst = 0.00;
        $totalIgst = 0.00;
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

            // Standard GST calculation (tax added to price)
            $itemTax = round(($lineTotal * $taxRatePercent) / 100, 2);
            $totalTax += $itemTax;

            if ($isSameState) {
                $halfTax = round($itemTax / 2, 2);
                $totalCgst += $halfTax;
                $totalSgst += ($itemTax - $halfTax);
            } else {
                $totalIgst += $itemTax;
            }

            $breakdown[] = [
                'name' => $item['name'] ?? 'Automotive Part',
                'line_total' => $lineTotal,
                'rate_percent' => $taxRatePercent,
                'tax_amount' => $itemTax,
            ];
        }

        return [
            'tax_amount' => round($totalTax, 2),
            'cgst_amount' => round($totalCgst, 2),
            'sgst_amount' => round($totalSgst, 2),
            'igst_amount' => round($totalIgst, 2),
            'tax_rate_percent' => $this->defaultRatePercent,
            'is_interstate' => !$isSameState,
            'breakdown' => $breakdown,
        ];
    }
}
