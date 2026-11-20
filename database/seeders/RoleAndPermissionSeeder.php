<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserPermission;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create permissions
        foreach (UserPermission::values() as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        // 2. Create roles and assign permissions
        $adminRole = Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
        $adminRole->syncPermissions(UserPermission::adminPermissions());

        $editorRole = Role::firstOrCreate(['name' => UserRole::Editor->value, 'guard_name' => 'web']);
        $editorRole->syncPermissions(UserPermission::editorPermissions());

        $customerRole = Role::firstOrCreate(['name' => UserRole::Customer->value, 'guard_name' => 'web']);
        $customerRole->syncPermissions(UserPermission::customerPermissions());

        $supplierRole = Role::firstOrCreate(['name' => UserRole::Supplier->value, 'guard_name' => 'web']);
        $supplierRole->syncPermissions(UserPermission::supplierPermissions());

        // 3. Default Admin user
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@autoparts.com'],
            [
                'name' => 'Auto Parts Admin',
                'phone' => '+91 98765 00001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );
        $adminUser->syncRoles([$adminRole]);

        // 4. Default Editor user
        $editorUser = User::updateOrCreate(
            ['email' => 'editor@autoparts.com'],
            [
                'name' => 'Catalog Specialist',
                'phone' => '+91 98765 00002',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );
        $editorUser->syncRoles([$editorRole]);

        // 5. Default Customer user
        $customerUser = User::updateOrCreate(
            ['email' => 'customer@autoparts.com'],
            [
                'name' => 'Vikram Singh',
                'phone' => '+91 98765 12345',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );
        $customerUser->syncRoles([$customerRole]);

        // 6. Default Supplier user
        $supplierUser = User::updateOrCreate(
            ['email' => 'supplier@autoparts.com'],
            [
                'name' => 'Rajesh Sharma',
                'company_name' => 'Apex Motorsport Spares Pvt. Ltd.',
                'phone' => '+91 98765 00003',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );
        $supplierUser->syncRoles([$supplierRole]);
    }
}
