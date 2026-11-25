<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Editor = 'editor';
    case Customer = 'customer';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Editor => 'Catalog Manager',
            self::Customer => 'Customer',
        };
    }

    public function dashboardRoute(): string
    {
        return match ($this) {
            self::Admin => 'admin.dashboard',
            self::Editor => 'admin.dashboard',
            self::Customer => 'customer.dashboard',
        };
    }

    public function accountRoute(): string
    {
        return match ($this) {
            self::Admin => 'admin.account',
            self::Editor => 'admin.account',
            self::Customer => 'customer.dashboard',
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
