<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierImportLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id',
        'connector_id',
        'source_type',
        'filename',
        'total_rows',
        'imported_rows',
        'updated_rows',
        'failed_rows',
        'status',
        'error_summary',
        'initiated_by',
    ];

    protected function casts(): array
    {
        return [
            'total_rows' => 'integer',
            'imported_rows' => 'integer',
            'updated_rows' => 'integer',
            'failed_rows' => 'integer',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    public function connector(): BelongsTo
    {
        return $this->belongsTo(SupplierConnector::class, 'connector_id');
    }

    public function initiator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }
}
