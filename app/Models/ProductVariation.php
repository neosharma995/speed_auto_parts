<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariation extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'sku',
        'part_number',
        'attributes_json',
        'price',
        'sale_price',
        'stock_quantity',
        'stock_status',
        'image',
        'weight',
        'is_default',
    ];

    protected $appends = [
        'effective_price',
        'discount_percentage',
        'is_in_stock',
    ];

    protected function casts(): array
    {
        return [
            'attributes_json' => 'array',
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'stock_quantity' => 'integer',
            'weight' => 'decimal:2',
            'is_default' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function compatibleVehicles(): HasMany
    {
        return $this->hasMany(ProductVehicle::class, 'product_variation_id');
    }

    protected function effectivePrice(): Attribute
    {
        return Attribute::make(
            get: fn () => ($this->sale_price !== null && $this->sale_price > 0 && $this->sale_price < $this->price)
                ? (float) $this->sale_price
                : (float) $this->price
        );
    }

    protected function discountPercentage(): Attribute
    {
        return Attribute::make(
            get: function (): int {
                $regular = (float) $this->price;
                $selling = (float) $this->sale_price;

                if ($regular > 0 && $selling > 0 && $regular > $selling) {
                    return (int) round((($regular - $selling) / $regular) * 100);
                }

                return 0;
            }
        );
    }

    protected function isInStock(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->stock_status === 'in_stock' && $this->stock_quantity > 0
        );
    }
}
