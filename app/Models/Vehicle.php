<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'year',
        'make',
        'model',
        'submodel',
        'engine',
        'engine_size',
        'fuel_type',
        'transmission',
        'body_type',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
        ];
    }

    public function productVehicles(): HasMany
    {
        return $this->hasMany(ProductVehicle::class);
    }

    public function getDisplayNameAttribute(): string
    {
        return "{$this->year} {$this->make} {$this->model} ({$this->engine})";
    }
}
