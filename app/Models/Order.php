<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'apartment',
        'city',
        'state',
        'pincode',
        'country',
        'billing_same_as_shipping',
        'billing_address',
        'billing_city',
        'billing_state',
        'billing_pincode',
        'shipping_method_title',
        'shipping_cost',
        'subtotal',
        'discount_amount',
        'coupon_code',
        'tax_amount',
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'total_amount',
        'currency',
        'payment_method',
        'payment_status',
        'delivery_status',
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
        'order_notes',
        'tracking_number',
        'tracking_carrier',
        'tracking_url',
        'paid_at',
        'shipped_at',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'shipping_cost' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'cgst_amount' => 'decimal:2',
            'sgst_amount' => 'decimal:2',
            'igst_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'billing_same_as_shipping' => 'boolean',
            'paid_at' => 'datetime',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order): void {
            if (empty($order->order_number)) {
                $order->order_number = 'AP-' . date('Ymd') . '-' . strtoupper(Str::random(5));
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopePaymentStatus($query, string $status)
    {
        return $query->where('payment_status', $status);
    }

    public function scopeDeliveryStatus($query, string $status)
    {
        return $query->where('delivery_status', $status);
    }
}
