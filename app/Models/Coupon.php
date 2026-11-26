<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_spend',
        'max_discount',
        'usage_limit',
        'usage_per_user',
        'times_used',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'min_spend' => 'decimal:2',
            'max_discount' => 'decimal:2',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function isValidForAmount(float $subtotal, ?int $userId = null): array
    {
        if (!$this->is_active) {
            return ['valid' => false, 'message' => 'This coupon is no longer active.'];
        }

        if ($this->starts_at && now()->lt($this->starts_at->copy()->startOfDay())) {
            return ['valid' => false, 'message' => 'This coupon is not active yet.'];
        }

        if ($this->expires_at && now()->gt($this->expires_at->copy()->endOfDay())) {
            return ['valid' => false, 'message' => 'This coupon has expired.'];
        }

        if ($this->usage_limit && $this->times_used >= $this->usage_limit) {
            return ['valid' => false, 'message' => 'This coupon usage limit has been reached.'];
        }

        if ($this->min_spend > 0 && $subtotal < (float) $this->min_spend) {
            return ['valid' => false, 'message' => "Minimum order amount of AED {$this->min_spend} required for this coupon."];
        }

        if ($userId && $this->usage_per_user > 0) {
            $userUses = Order::where('user_id', $userId)->where('coupon_code', $this->code)->count();
            if ($userUses >= $this->usage_per_user) {
                return ['valid' => false, 'message' => 'You have already used this coupon maximum times.'];
            }
        }

        return ['valid' => true, 'message' => 'Coupon applied successfully!'];
    }

    public function calculateDiscount(float $subtotal): float
    {
        if ($this->type === 'percentage') {
            $discount = ($subtotal * (float) $this->value) / 100;
            if ($this->max_discount !== null && $this->max_discount > 0) {
                $discount = min($discount, (float) $this->max_discount);
            }
            return round($discount, 2);
        }

        return min(round((float) $this->value, 2), $subtotal);
    }
}
