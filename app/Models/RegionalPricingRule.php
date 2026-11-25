<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegionalPricingRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'country_code',
        'country_name',
        'currency_code',
        'margin_percent',
        'tax_rate_percent',
        'flat_shipping_cost',
        'free_shipping_threshold',
        'min_order_amount',
        'is_selling_enabled',
        'is_default',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'margin_percent' => 'decimal:2',
            'tax_rate_percent' => 'decimal:2',
            'flat_shipping_cost' => 'decimal:2',
            'free_shipping_threshold' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'is_selling_enabled' => 'boolean',
            'is_default' => 'boolean',
        ];
    }
}
