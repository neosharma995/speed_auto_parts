<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'approval_status',
        'invitation_token',
        'invited_at',
        'approved_at',
        'approved_by',
        'country_code',
        'country_name',
        'tax_id',
        'registration_number',
        'website',
        'address',
        'secondary_contact_name',
        'secondary_contact_email',
        'secondary_contact_phone',
        'payment_terms',
        'default_discount_percent',
        'minimum_order_value',
        'currency_code',
        'commercial_conditions',
        'shipping_methods',
        'default_shipping_cost',
        'lead_time_days',
        'return_policy',
        'warranty_terms',
        'reliability_score',
        'priority_rank',
        'is_preferred',
        'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'invited_at' => 'datetime',
            'approved_at' => 'datetime',
            'default_discount_percent' => 'decimal:2',
            'minimum_order_value' => 'decimal:2',
            'default_shipping_cost' => 'decimal:2',
            'lead_time_days' => 'integer',
            'reliability_score' => 'decimal:2',
            'priority_rank' => 'integer',
            'is_preferred' => 'boolean',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
