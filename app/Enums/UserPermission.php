<?php

declare(strict_types=1);

namespace App\Enums;

enum UserPermission: string
{
    // Automotive Admin Permissions
    case ManageOrders = 'manage orders';
    case ManageProducts = 'manage products';
    case ManageCategories = 'manage categories';
    case ManageBrands = 'manage brands';
    case ManageAttributes = 'manage attributes';
    case ManageVariations = 'manage variations';
    case ManageVehicles = 'manage vehicles';
    case ManageInventory = 'manage inventory';
    case ManageCustomers = 'manage customers';
    case ManageCoupons = 'manage coupons';
    case ManageTaxes = 'manage taxes';
    case ManageReviews = 'manage reviews';
    case ManageSettings = 'manage settings';
    case ManageStaff = 'manage staff';
    case ManageRoles = 'manage roles';

    // Content Editor
    case ManageContent = 'manage content';

    // Customer
    case ViewProducts = 'view products';
    case PlaceOrders = 'place orders';
    case ManageProfile = 'manage profile';
    case ViewOwnOrders = 'view own orders';

    public static function adminPermissions(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function editorPermissions(): array
    {
        return [
            self::ManageProducts->value,
            self::ManageCategories->value,
            self::ManageBrands->value,
            self::ManageAttributes->value,
            self::ManageVariations->value,
            self::ManageVehicles->value,
            self::ManageInventory->value,
            self::ManageReviews->value,
            self::ManageContent->value,
        ];
    }

    public static function customerPermissions(): array
    {
        return [
            self::ViewProducts->value,
            self::PlaceOrders->value,
            self::ManageProfile->value,
            self::ViewOwnOrders->value,
        ];
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
