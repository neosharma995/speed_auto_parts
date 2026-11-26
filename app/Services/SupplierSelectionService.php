<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;
use App\Models\Setting;
use App\Models\SupplierOffer;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SupplierSelectionService
{
    /**
     * Default configurable profitability & service rule weights (total = 100).
     *
     * @return array<string, mixed>
     */
    public function getRules(): array
    {
        $defaults = [
            'weight_price' => 35,
            'weight_stock' => 20,
            'weight_delivery' => 15,
            'weight_shipping' => 10,
            'weight_reliability' => 15,
            'weight_commercial' => 5,
            'min_margin_percent' => 10,
            'require_in_stock' => true,
        ];

        if (! Schema::hasTable('settings')) {
            return $defaults;
        }

        $raw = Setting::get('supplier_selection_rules');
        if (! $raw) {
            return $defaults;
        }

        $decoded = is_array($raw) ? $raw : json_decode((string) $raw, true);

        return is_array($decoded) ? array_merge($defaults, $decoded) : $defaults;
    }

    /**
     * Persist updated auto-selection profitability & service rules.
     *
     * @param  array<string, mixed>  $rules
     */
    public function saveRules(array $rules): array
    {
        $clean = [
            'weight_price' => max(0, min(100, (int) ($rules['weight_price'] ?? 35))),
            'weight_stock' => max(0, min(100, (int) ($rules['weight_stock'] ?? 20))),
            'weight_delivery' => max(0, min(100, (int) ($rules['weight_delivery'] ?? 15))),
            'weight_shipping' => max(0, min(100, (int) ($rules['weight_shipping'] ?? 10))),
            'weight_reliability' => max(0, min(100, (int) ($rules['weight_reliability'] ?? 15))),
            'weight_commercial' => max(0, min(100, (int) ($rules['weight_commercial'] ?? 5))),
            'min_margin_percent' => max(0, min(95, (float) ($rules['min_margin_percent'] ?? 10))),
            'require_in_stock' => (bool) ($rules['require_in_stock'] ?? true),
        ];

        Setting::set('supplier_selection_rules', $clean);

        return $clean;
    }

    /**
     * Score and compare all active supplier offers for a given product.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function compareOffersForProduct(Product $product): Collection
    {
        $rules = $this->getRules();
        $offers = SupplierOffer::query()
            ->where('product_id', $product->id)
            ->where('is_active', true)
            ->with(['supplier.supplierProfile'])
            ->get();

        if ($offers->isEmpty()) {
            return collect();
        }

        $sellingPrice = (float) ($product->effective_price ?: $product->base_price ?: 0);

        $landedCosts = $offers->map(fn (SupplierOffer $o) => $o->effective_landed_cost);
        $minCost = max(0.01, (float) $landedCosts->min());
        $maxCost = max($minCost, (float) $landedCosts->max());

        $leadTimes = $offers->map(fn (SupplierOffer $o) => max(1, $o->total_lead_days));
        $minLead = (int) $leadTimes->min();
        $maxLead = max($minLead, (int) $leadTimes->max());

        $shippingCosts = $offers->map(fn (SupplierOffer $o) => (float) $o->shipping_cost);
        $minShip = (float) $shippingCosts->min();
        $maxShip = max($minShip, (float) $shippingCosts->max());

        $maxStock = max(1, (int) $offers->max('stock_quantity'));

        $totalWeight = max(
            1,
            $rules['weight_price']
            + $rules['weight_stock']
            + $rules['weight_delivery']
            + $rules['weight_shipping']
            + $rules['weight_reliability']
            + $rules['weight_commercial']
        );

        $evaluated = $offers->map(function (SupplierOffer $offer) use (
            $rules,
            $sellingPrice,
            $minCost,
            $maxCost,
            $minLead,
            $maxLead,
            $minShip,
            $maxShip,
            $maxStock,
            $totalWeight
        ) {
            $profile = $offer->supplier?->supplierProfile;
            $landedCost = $offer->effective_landed_cost;
            $leadDays = max(1, $offer->total_lead_days);
            $shipping = (float) $offer->shipping_cost;
            $stock = (int) $offer->stock_quantity;
            $discount = (float) $offer->commercial_discount_percent;
            $reliability = (float) ($offer->reliability_score ?? $profile?->reliability_score ?? 80.0);
            $priorityRank = (int) ($profile?->priority_rank ?? 50);
            $isPreferred = (bool) ($profile?->is_preferred ?? false);

            // Normalized component scores (0..100, higher is better)
            $priceScore = $maxCost > $minCost
                ? 100 - (($landedCost - $minCost) / ($maxCost - $minCost)) * 100
                : 100.0;

            $stockScore = $stock <= 0 ? 0.0 : min(100.0, ($stock / $maxStock) * 100);

            $deliveryScore = $maxLead > $minLead
                ? 100 - (($leadDays - $minLead) / ($maxLead - $minLead)) * 100
                : 100.0;

            $shippingScore = $maxShip > $minShip
                ? 100 - (($shipping - $minShip) / ($maxShip - $minShip)) * 100
                : 100.0;

            $reliabilityScore = max(0.0, min(100.0, $reliability));

            // Commercial conditions score: discount + priority rank bonus
            $priorityBonus = max(0.0, min(40.0, (100 - min(100, $priorityRank)) * 0.4));
            $commercialScore = min(100.0, ($discount * 3.0) + $priorityBonus + ($isPreferred ? 15.0 : 0.0));

            $weighted = (
                ($priceScore * $rules['weight_price'])
                + ($stockScore * $rules['weight_stock'])
                + ($deliveryScore * $rules['weight_delivery'])
                + ($shippingScore * $rules['weight_shipping'])
                + ($reliabilityScore * $rules['weight_reliability'])
                + ($commercialScore * $rules['weight_commercial'])
            ) / $totalWeight;

            // Penalize out-of-stock offers when require_in_stock is enabled
            if ($rules['require_in_stock'] && $stock <= 0) {
                $weighted *= 0.25;
            }

            $marginAmount = $sellingPrice > 0 ? round($sellingPrice - $landedCost, 2) : 0.0;
            $marginPercent = $sellingPrice > 0 ? round(($marginAmount / $sellingPrice) * 100, 2) : 0.0;

            if ($sellingPrice > 0 && $marginPercent < (float) $rules['min_margin_percent']) {
                $weighted *= 0.85;
            }

            $finalScore = round(max(0.0, min(100.0, $weighted)), 2);

            return [
                'offer' => $offer,
                'landed_cost' => $landedCost,
                'lead_days' => $leadDays,
                'margin_amount' => $marginAmount,
                'margin_percent' => $marginPercent,
                'reliability' => $reliabilityScore,
                'priority_rank' => $priorityRank,
                'is_preferred' => $isPreferred,
                'score' => $finalScore,
                'breakdown' => [
                    'price' => round($priceScore, 1),
                    'stock' => round($stockScore, 1),
                    'delivery' => round($deliveryScore, 1),
                    'shipping' => round($shippingScore, 1),
                    'reliability' => round($reliabilityScore, 1),
                    'commercial' => round($commercialScore, 1),
                ],
            ];
        });

        return $evaluated->sortByDesc('score')->values();
    }

    /**
     * Automatically select the best supplier offer for a product (respecting manual admin overrides by default).
     */
    public function selectBestOfferForProduct(Product $product, bool $respectManualOverride = true): ?SupplierOffer
    {
        $evaluated = $this->compareOffersForProduct($product);
        if ($evaluated->isEmpty()) {
            return null;
        }

        return DB::transaction(function () use ($product, $evaluated, $respectManualOverride) {
            foreach ($evaluated as $row) {
                /** @var SupplierOffer $offer */
                $offer = $row['offer'];
                $offer->calculated_score = $row['score'];
                $offer->save();
            }

            $manualOffer = $respectManualOverride
                ? $evaluated->first(fn ($row) => $row['offer']->is_manual_override === true)
                : null;

            $winnerRow = $manualOffer ?? $evaluated->first();
            /** @var SupplierOffer $winner */
            $winner = $winnerRow['offer'];

            SupplierOffer::where('product_id', $product->id)
                ->where('id', '!=', $winner->id)
                ->update([
                    'is_selected' => false,
                    'is_manual_override' => $respectManualOverride ? DB::raw('is_manual_override') : false,
                ]);

            $winner->is_selected = true;
            if (! $respectManualOverride) {
                $winner->is_manual_override = false;
            }
            $winner->save();

            // Sync winning supplier purchase cost internally (never shown to public customers)
            $product->supplier_id = $winner->supplier_id;
            $product->supplier_price = $winner->purchase_price;
            $product->cost_price = $winner->effective_landed_cost;
            $product->save();

            return $winner->fresh(['supplier']);
        });
    }

    /**
     * Manually override supplier selection for a product.
     */
    public function overrideOffer(Product $product, SupplierOffer $offer): SupplierOffer
    {
        return DB::transaction(function () use ($product, $offer) {
            SupplierOffer::where('product_id', $product->id)
                ->update([
                    'is_selected' => false,
                    'is_manual_override' => false,
                ]);

            $offer->is_selected = true;
            $offer->is_manual_override = true;
            $offer->save();

            $product->supplier_id = $offer->supplier_id;
            $product->supplier_price = $offer->purchase_price;
            $product->cost_price = $offer->effective_landed_cost;
            $product->save();

            $this->compareOffersForProduct($product)->each(function ($row) {
                $row['offer']->update(['calculated_score' => $row['score']]);
            });

            return $offer->fresh(['supplier']);
        });
    }

    /**
     * Clear manual override and re-run automatic selection for a product.
     */
    public function clearOverride(Product $product): ?SupplierOffer
    {
        SupplierOffer::where('product_id', $product->id)->update(['is_manual_override' => false]);

        return $this->selectBestOfferForProduct($product, false);
    }

    /**
     * Re-evaluate all products that have supplier offers.
     */
    public function recalculateAll(): int
    {
        $productIds = SupplierOffer::query()->distinct()->pluck('product_id');
        $count = 0;

        foreach (Product::whereIn('id', $productIds)->get() as $product) {
            if ($this->selectBestOfferForProduct($product, true)) {
                $count++;
            }
        }

        return $count;
    }
}
