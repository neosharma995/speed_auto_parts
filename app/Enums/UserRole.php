<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Editor = 'editor';
    case Supplier = 'supplier';
    case Customer = 'customer';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Editor => 'Catalog Manager',
            self::Supplier => 'Supplier',
            self::Customer => 'Customer',
        };
    }

    public function dashboardRoute(): string
    {
        return match ($this) {
            self::Admin => 'admin.dashboard',
            self::Editor => 'admin.dashboard',
            self::Supplier => 'supplier.dashboard',
            self::Customer => 'customer.dashboard',
        };
    }

    public function accountRoute(): string
    {
        return match ($this) {
            self::Admin => 'admin.account',
            self::Editor => 'admin.account',
            self::Supplier => 'supplier.dashboard',
            self::Customer => 'customer.account',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
