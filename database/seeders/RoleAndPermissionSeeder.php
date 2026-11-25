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
            ['email' => 'admin@autosparts.com'],
            [
                'name' => 'Autos Parts Admin',
                'phone' => '+971 50 512 0001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );
        $adminUser->syncRoles([$adminRole]);

        // 4. Default Editor user
        $editorUser = User::updateOrCreate(
            ['email' => 'editor@autosparts.com'],
            [
                'name' => 'Catalog Specialist',
                'phone' => '+971 50 512 0002',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );
        $editorUser->syncRoles([$editorRole]);

        // 5. Default Customer user
        $customerUser = User::updateOrCreate(
            ['email' => 'customer@autosparts.com'],
            [
                'name' => 'Tariq Al Mansoori',
                'phone' => '+971 50 512 3456',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );
        $customerUser->syncRoles([$customerRole]);

        // 6. Default Supplier user
        $supplierUser = User::updateOrCreate(
            ['email' => 'supplier@autosparts.com'],
            [
                'name' => 'Omar Haddad',
                'company_name' => 'Apex Motorsport Spares LLC (Dubai)',
                'phone' => '+971 4 512 0003',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );
        $supplierUser->syncRoles([$supplierRole]);
    }
}
