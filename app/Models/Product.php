<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand_id',
        'category_id',
        'name',
        'slug',
        'sku',
        'part_number',
        'short_description',
        'description',
        'technical_specifications',
        'main_image',
        'gallery_images',
        'product_type',
        'base_price',
        'sale_price',
        'cost_price',
        'stock_quantity',
        'stock_status',
        'weight',
        'weight_unit',
        'dimensions',
        'is_featured',
        'is_best_seller',
        'is_new_arrival',
        'status',
        'seo_title',
        'seo_description',
        'rating',
        'rating_count',
    ];

    protected $casts = [
        'gallery_images' => 'array',
        'dimensions' => 'array',
        'base_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'weight' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_best_seller' => 'boolean',
        'is_new_arrival' => 'boolean',
        'rating' => 'decimal:2',
        'rating_count' => 'integer',
    ];

    protected $appends = [
        'effective_price',
        'discount_percentage',
        'is_in_stock',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (self $product): void {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variations(): HasMany
    {
        return $this->hasMany(ProductVariation::class);
    }

    public function attributes(): BelongsToMany
    {
        return $this->belongsToMany(ProductAttribute::class, 'product_attribute_product', 'product_id', 'attribute_id');
    }

    public function productVehicles(): HasMany
    {
        return $this->hasMany(ProductVehicle::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class)->where('is_approved', true);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeBestSeller($query)
    {
        return $query->where('is_best_seller', true);
    }

    public function scopeNewArrival($query)
    {
        return $query->where('is_new_arrival', true);
    }

    public function scopeCompatibleWith($query, int $vehicleId)
    {
        return $query->whereHas('productVehicles', function ($q) use ($vehicleId) {
            $q->where('vehicle_id', $vehicleId);
        });
    }

    protected function effectivePrice(): Attribute
    {
        return Attribute::make(
            get: fn () => ($this->sale_price !== null && $this->sale_price > 0 && $this->sale_price < $this->base_price)
                ? (float) $this->sale_price
                : (float) $this->base_price
        );
    }

    protected function discountPercentage(): Attribute
    {
        return Attribute::make(
            get: function (): int {
                $regular = (float) $this->base_price;
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
            get: function (): bool {
                if ($this->product_type === 'variable') {
                    return $this->variations()->where('stock_status', 'in_stock')->where('stock_quantity', '>', 0)->exists();
                }
                return $this->stock_status === 'in_stock' && $this->stock_quantity > 0;
            }
        );
    }
}
