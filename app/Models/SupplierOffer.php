<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierOffer extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'supplier_id',
        'supplier_sku',
        'purchase_price',
        'currency_code',
        'stock_quantity',
        'preparation_days',
        'delivery_days',
        'shipping_cost',
        'commercial_discount_percent',
        'commercial_terms',
        'reliability_score',
        'is_active',
        'is_selected',
        'is_manual_override',
        'calculated_score',
        'last_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'purchase_price' => 'decimal:2',
            'stock_quantity' => 'integer',
            'preparation_days' => 'integer',
            'delivery_days' => 'integer',
            'shipping_cost' => 'decimal:2',
            'commercial_discount_percent' => 'decimal:2',
            'reliability_score' => 'decimal:2',
            'is_active' => 'boolean',
            'is_selected' => 'boolean',
            'is_manual_override' => 'boolean',
            'calculated_score' => 'decimal:2',
            'last_synced_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    public function getEffectiveLandedCostAttribute(): float
    {
        $price = (float) $this->purchase_price;
        $discount = (float) $this->commercial_discount_percent;
        $netPrice = $price * (1 - max(0, min(100, $discount)) / 100);

        return round($netPrice + (float) $this->shipping_cost, 2);
    }

    public function getTotalLeadDaysAttribute(): int
    {
        return (int) $this->preparation_days + (int) $this->delivery_days;
    }
}
