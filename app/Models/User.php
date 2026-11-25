<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'company_name',
        'password',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::Admin->value);
    }

    public function isCustomer(): bool
    {
        return $this->hasRole(UserRole::Customer->value);
    }

    public function isEditor(): bool
    {
        return $this->hasRole(UserRole::Editor->value);
    }

    public function isSupplier(): bool
    {
        return $this->hasRole(UserRole::Supplier->value);
    }

    public function isStaff(): bool
    {
        return $this->isAdmin()
            || $this->isEditor()
            || $this->roles()->whereNotIn('name', [UserRole::Customer->value, UserRole::Supplier->value])->exists();
    }

    public function dashboardRoute(): string
    {
        if ($this->isAdmin() || $this->isEditor() || $this->isStaff()) {
            return UserRole::Admin->dashboardRoute();
        }
        if ($this->isSupplier()) {
            return UserRole::Supplier->dashboardRoute();
        }
        return UserRole::Customer->dashboardRoute();
    }

    public function accountRoute(): string
    {
        if ($this->isAdmin() || $this->isEditor() || $this->isStaff()) {
            return UserRole::Admin->accountRoute();
        }
        if ($this->isSupplier()) {
            return UserRole::Supplier->accountRoute();
        }
        return UserRole::Customer->accountRoute();
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class, 'user_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class, 'user_id');
    }

    public function wishlist(): HasMany
    {
        return $this->hasMany(Wishlist::class, 'user_id');
    }

    public function suppliedProducts(): HasMany
    {
        return $this->hasMany(Product::class, 'supplier_id');
    }

    public function stockTransfers(): HasMany
    {
        return $this->hasMany(StockTransfer::class, 'supplier_id');
    }

    public function updateProfile(array $attributes): void
    {
        $this->fill($attributes);

        if ($this->isDirty('email')) {
            $this->email_verified_at = null;
        }

        $this->save();
    }

    public function updatePassword(string $password): void
    {
        $this->update([
            'password' => Hash::make($password),
        ]);
    }
}
