<?php

declare(strict_types=1);

namespace App\Enums;

enum UserPermission: string
{
    // Admin Sidebar Element Permissions
    case ViewDashboard = 'view dashboard';
    case ManageOrders = 'manage orders';
    case ManageSuppliers = 'manage suppliers';
    case ManageWarehouse = 'manage warehouse';
    case ManageCatalogue = 'manage catalogue';
    case ManageProducts = 'manage products';
    case ManageCategories = 'manage categories';
    case ManageBrands = 'manage brands';
    case ManageVehicles = 'manage vehicles';
    case ManageCustomers = 'manage customers';
    case ManageCoupons = 'manage coupons';
    case ManageReviews = 'manage reviews';
    case ManageRoles = 'manage roles';
    case ManageSettings = 'manage settings';

    // Additional Granular / Legacy Admin Permissions
    case ManageAttributes = 'manage attributes';
    case ManageVariations = 'manage variations';
    case ManageInventory = 'manage inventory';
    case ManageTaxes = 'manage taxes';
    case ManageStaff = 'manage staff';

    // Supplier
    case SupplierManageProducts = 'supplier manage products';
    case SupplierSendLots = 'supplier send lots';

    // Content Editor
    case ManageContent = 'manage content';

    // Customer
    case ViewProducts = 'view products';
    case PlaceOrders = 'place orders';
    case ManageProfile = 'manage profile';
    case ViewOwnOrders = 'view own orders';

    /**
     * Canonical list of all Admin Sidebar elements and their permissions.
     *
     * @return list<array{name: string, label: string, group: string, route: string, description: string}>
     */
    public static function sidebarPermissions(): array
    {
        return [
            // Operations
            [
                'name' => self::ViewDashboard->value,
                'label' => 'Dashboard',
                'group' => 'Operations',
                'route' => '/admin/dashboard',
                'description' => 'View store KPIs, revenue summary, alerts, and recent activity',
            ],
            [
                'name' => self::ManageOrders->value,
                'label' => 'Orders',
                'group' => 'Operations',
                'route' => '/admin/orders',
                'description' => 'View customer orders, update fulfillment status, and manage tracking',
            ],

            // Supply Chain
            [
                'name' => self::ManageSuppliers->value,
                'label' => 'Suppliers',
                'group' => 'Supply Chain',
                'route' => '/admin/suppliers',
                'description' => 'Manage supplier accounts and receive/reject incoming supplier lots',
            ],
            [
                'name' => self::ManageWarehouse->value,
                'label' => 'Warehouse',
                'group' => 'Supply Chain',
                'route' => '/admin/warehouse',
                'description' => 'Manage warehouse & catalogue stock levels and transfer logs',
            ],
            [
                'name' => self::ManageCatalogue->value,
                'label' => 'Website Catalogue',
                'group' => 'Supply Chain',
                'route' => '/admin/catalogue',
                'description' => 'Transfer warehouse stock to storefront and manage selling prices',
            ],

            // Automotive Catalog
            [
                'name' => self::ManageProducts->value,
                'label' => 'Products',
                'group' => 'Automotive Catalog',
                'route' => '/admin/products',
                'description' => 'Create, edit, and delete products, attributes, and variations',
            ],
            [
                'name' => self::ManageCategories->value,
                'label' => 'Categories',
                'group' => 'Automotive Catalog',
                'route' => '/admin/categories',
                'description' => 'Create, edit, and delete automotive product categories',
            ],
            [
                'name' => self::ManageBrands->value,
                'label' => 'Brands',
                'group' => 'Automotive Catalog',
                'route' => '/admin/brands',
                'description' => 'Create, edit, and delete manufacturer brands',
            ],
            [
                'name' => self::ManageVehicles->value,
                'label' => 'Vehicles & Fitment',
                'group' => 'Automotive Catalog',
                'route' => '/admin/vehicles',
                'description' => 'Manage the vehicle compatibility & fitment database',
            ],

            // Customers & Marketing
            [
                'name' => self::ManageCustomers->value,
                'label' => 'Customers',
                'group' => 'Customers & Marketing',
                'route' => '/admin/customers',
                'description' => 'View registered customer directory and order counts',
            ],
            [
                'name' => self::ManageCoupons->value,
                'label' => 'Coupons',
                'group' => 'Customers & Marketing',
                'route' => '/admin/coupons',
                'description' => 'Create, edit, and delete promotional discount coupons',
            ],
            [
                'name' => self::ManageReviews->value,
                'label' => 'Reviews',
                'group' => 'Customers & Marketing',
                'route' => '/admin/reviews',
                'description' => 'Approve, unapprove, and delete customer product reviews',
            ],

            // Settings
            [
                'name' => self::ManageRoles->value,
                'label' => 'Roles & Permissions',
                'group' => 'Settings',
                'route' => '/admin/roles',
                'description' => 'Manage staff roles, sidebar permissions, and staff accounts',
            ],
            [
                'name' => self::ManageSettings->value,
                'label' => 'Settings',
                'group' => 'Settings',
                'route' => '/admin/settings',
                'description' => 'Configure store identity, regional settings, and UAE VAT tax rates',
            ],
        ];
    }

    /**
     * @return list<string>
     */
    public static function sidebarPermissionNames(): array
    {
        return array_column(self::sidebarPermissions(), 'name');
    }

    public static function adminPermissions(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function editorPermissions(): array
    {
        return [
            self::ViewDashboard->value,
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

    public static function supplierPermissions(): array
    {
        return [
            self::SupplierManageProducts->value,
            self::SupplierSendLots->value,
        ];
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
