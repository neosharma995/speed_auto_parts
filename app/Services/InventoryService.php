<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryService
{
    /**
     * Deduct stock for items in an order.
     */
    public function deductStockForOrder(array $items): void
    {
        DB::transaction(function () use ($items) {
            foreach ($items as $item) {
                $qty = (int) ($item['quantity'] ?? 1);
                $variationId = $item['variationId'] ?? $item['product_variation_id'] ?? null;
                $productId = $item['productId'] ?? $item['product_id'] ?? null;

                if ($variationId) {
                    $variation = ProductVariation::lockForUpdate()->find($variationId);
                    if ($variation) {
                        $variation->stock_quantity = max(0, $variation->stock_quantity - $qty);
                        if ($variation->stock_quantity <= 0) {
                            $variation->stock_status = 'out_of_stock';
                        }
                        $variation->save();
                    }
                }

                if ($productId) {
                    $product = Product::lockForUpdate()->find($productId);
                    if ($product) {
                        $product->stock_quantity = max(0, $product->stock_quantity - $qty);
                        if ($product->stock_quantity <= 0 && $product->product_type === 'simple') {
                            $product->stock_status = 'out_of_stock';
                        }
                        $product->save();
                    }
                }
            }
        });
    }

    /**
     * Restock items when an order is cancelled.
     */
    public function restockOrder(array $items): void
    {
        DB::transaction(function () use ($items) {
            foreach ($items as $item) {
                $qty = (int) ($item['quantity'] ?? 1);
                $variationId = $item['product_variation_id'] ?? null;
                $productId = $item['product_id'] ?? null;

                if ($variationId) {
                    $variation = ProductVariation::lockForUpdate()->find($variationId);
                    if ($variation) {
                        $variation->stock_quantity += $qty;
                        if ($variation->stock_quantity > 0) {
                            $variation->stock_status = 'in_stock';
                        }
                        $variation->save();
                    }
                }

                if ($productId) {
                    $product = Product::lockForUpdate()->find($productId);
                    if ($product) {
                        $product->stock_quantity += $qty;
                        if ($product->stock_quantity > 0) {
                            $product->stock_status = 'in_stock';
                        }
                        $product->save();
                    }
                }
            }
        });
    }
}
