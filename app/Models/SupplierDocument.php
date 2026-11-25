<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id',
        'title',
        'document_type',
        'file_path',
        'original_name',
        'file_size',
        'expires_at',
        'uploaded_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'expires_at' => 'date',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
