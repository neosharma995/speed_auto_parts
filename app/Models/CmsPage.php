<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CmsPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'subtitle',
        'content',
        'translations',
        'sections',
        'is_active',
    ];

    protected $casts = [
        'translations' => 'array',
        'sections' => 'array',
        'is_active' => 'boolean',
    ];
}
