<?php

declare(strict_types=1);

namespace App\Services\Connectors;

use App\Models\Product;
use App\Models\SupplierConnector;

class MockB2bConnector implements SupplierConnectorInterface
{
    public function driver(): string
    {
        return 'mock_b2b';
    }

    public function label(): string
    {
        return 'Authorized B2B Sandbox Connector (Live Demo)';
    }

    public function testConnection(SupplierConnector $connector): array
    {
        $count = Product::where('status', 'published')->count();

        return [
            'ok' => true,
            'message' => "Authorized B2B handshake verified. Ready to sync {$count} catalog offers.",
            'sample_count' => $count,
        ];
    }

    public function fetchOffers(SupplierConnector $connector): array
    {
        $profile = $connector->supplier?->supplierProfile;
        $discount = (float) ($profile?->default_discount_percent ?? 5.0);
        $leadDays = (int) ($profile?->lead_time_days ?? 2);
        $shipping = (float) ($profile?->default_shipping_cost ?? 25.0);

        return Product::where('status', 'published')
            ->take(10)
            ->get()
            ->map(function (Product $product) use ($discount, $leadDays, $shipping) {
                $base = (float) $product->base_price;
                $offerPrice = round($base * 0.62, 2);

                return [
                    'sku' => $product->sku,
                    'part_number' => $product->part_number,
                    'supplier_sku' => 'B2B-' . $product->sku,
                    'purchase_price' => max(10, $offerPrice),
                    'stock_quantity' => 45,
                    'preparation_days' => 1,
                    'delivery_days' => max(1, $leadDays),
                    'shipping_cost' => $shipping,
                    'commercial_discount_percent' => $discount,
                    'commercial_terms' => 'B2B API Auto-Sync',
                ];
            })
            ->all();
    }
}
