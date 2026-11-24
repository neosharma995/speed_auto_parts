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

        // 3. Default Admin user
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@autoparts.com'],
            [
                'name' => 'Speed Autos Parts Admin',
                'phone' => '+971 50 512 0001',
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
                'phone' => '+971 50 512 0002',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );
        $editorUser->syncRoles([$editorRole]);
    }
}
