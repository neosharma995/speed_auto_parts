<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupplierConnector extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id',
        'name',
        'driver',
        'endpoint_url',
        'auth_type',
        'credentials_json',
        'field_mapping_json',
        'sync_frequency',
        'is_active',
        'last_synced_at',
        'last_status',
        'last_message',
        'last_items_synced',
    ];

    protected $hidden = [
        'credentials_json',
    ];

    protected function casts(): array
    {
        return [
            'field_mapping_json' => 'array',
            'is_active' => 'boolean',
            'last_synced_at' => 'datetime',
            'last_items_synced' => 'integer',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    public function importLogs(): HasMany
    {
        return $this->hasMany(SupplierImportLog::class, 'connector_id');
    }

    /**
     * @return array<string, mixed>
     */
    public function decodedCredentials(): array
    {
        if (empty($this->credentials_json)) {
            return [];
        }

        $decoded = json_decode((string) $this->credentials_json, true);

        return is_array($decoded) ? $decoded : [];
    }
}
