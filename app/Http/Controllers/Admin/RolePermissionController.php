<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\UserPermission;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureSidebarPermissionsExist();

        $sidebarItems = UserPermission::sidebarPermissions();
        $sidebarNames = UserPermission::sidebarPermissionNames();

        $roles = Role::query()
            ->whereNotIn('name', [UserRole::Customer->value, UserRole::Supplier->value])
            ->with('permissions')
            ->withCount('users')
            ->orderByRaw("CASE WHEN name = 'admin' THEN 0 WHEN name = 'editor' THEN 1 ELSE 2 END")
            ->orderBy('name')
            ->get()
            ->map(function (Role $role) use ($sidebarNames) {
                $rolePerms = $role->name === UserRole::Admin->value
                    ? $sidebarNames
                    : $role->permissions->pluck('name')->intersect($sidebarNames)->values()->all();

                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => Str::headline($role->name),
                    'users_count' => $role->users_count,
                    'permissions' => $rolePerms,
                    'is_system' => in_array($role->name, [UserRole::Admin->value, UserRole::Editor->value], true),
                    'is_admin' => $role->name === UserRole::Admin->value,
                ];
            })
            ->values();

        $staffQuery = User::query()
            ->whereHas('roles', fn ($q) => $q->whereNotIn('name', [UserRole::Customer->value, UserRole::Supplier->value]))
            ->with('roles');

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $staffQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $staffUsers = $staffQuery
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'status' => $u->status ?: 'active',
                'role' => $u->roles->first()?->name ?? '',
                'created_at' => $u->created_at?->toDateTimeString(),
            ]);

        $permissionGroups = [];
        foreach ($sidebarItems as $item) {
            $permissionGroups[$item['group']][] = $item;
        }

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'staffUsers' => $staffUsers,
            'permissionGroups' => $permissionGroups,
            'allSidebarPermissions' => $sidebarItems,
            'activeTab' => $request->query('tab') === 'staff' ? 'staff' : 'roles',
            'filters' => (object) $request->only(['search']),
        ]);
    }

    public function storeRole(Request $request): RedirectResponse
    {
        $this->ensureSidebarPermissionsExist();

        $normalizedName = Str::slug(trim((string) $request->input('name', '')), '_');
        $request->merge(['name' => $normalizedName]);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:60',
                Rule::notIn([UserRole::Customer->value, UserRole::Supplier->value]),
                Rule::unique('roles', 'name'),
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in(UserPermission::sidebarPermissionNames())],
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return back()->with('success', "Role '" . Str::headline($role->name) . "' created with " . count($validated['permissions'] ?? []) . ' permissions.');
    }

    public function updateRole(Request $request, Role $role): RedirectResponse
    {
        if (in_array($role->name, [UserRole::Customer->value, UserRole::Supplier->value], true)) {
            abort(403, 'Cannot modify storefront customer or supplier roles here.');
        }

        $this->ensureSidebarPermissionsExist();

        if ($role->name === UserRole::Admin->value) {
            $role->syncPermissions(UserPermission::adminPermissions());
            app()[PermissionRegistrar::class]->forgetCachedPermissions();

            return back()->with('success', 'Administrator role retains full access to all sidebar modules.');
        }

        $isSystem = in_array($role->name, [UserRole::Admin->value, UserRole::Editor->value], true);
        $normalizedName = $isSystem
            ? $role->name
            : Str::slug(trim((string) $request->input('name', $role->name)), '_');

        $request->merge(['name' => $normalizedName]);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:60',
                Rule::notIn([UserRole::Customer->value, UserRole::Supplier->value]),
                Rule::unique('roles', 'name')->ignore($role->id),
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in(UserPermission::sidebarPermissionNames())],
        ]);

        if (! $isSystem) {
            $role->update(['name' => $validated['name']]);
        }

        $role->syncPermissions($validated['permissions'] ?? []);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return back()->with('success', "Role '" . Str::headline($role->name) . "' permissions updated.");
    }

    public function destroyRole(Role $role): RedirectResponse
    {
        if (in_array($role->name, [UserRole::Admin->value, UserRole::Editor->value, UserRole::Customer->value, UserRole::Supplier->value], true)) {
            return back()->with('error', 'Default system roles cannot be deleted.');
        }

        if ($role->users()->count() > 0) {
            return back()->with('error', 'Reassign staff members using this role before deleting it.');
        }

        $label = Str::headline($role->name);
        $role->delete();
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return back()->with('success', "Role '{$label}' deleted.");
    }

    public function storeStaff(Request $request): RedirectResponse
    {
        $allowedRoles = Role::query()
            ->whereNotIn('name', [UserRole::Customer->value, UserRole::Supplier->value])
            ->pluck('name')
            ->all();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', 'string', Rule::in($allowedRoles)],
            'password' => ['required', 'string', 'min:6'],
            'status' => ['nullable', 'in:active,suspended'],
        ]);

        $staff = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
            'status' => $validated['status'] ?? 'active',
        ]);

        $role = Role::where('name', $validated['role'])->where('guard_name', 'web')->firstOrFail();
        $staff->syncRoles([$role]);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return back()->with('success', "Staff member '{$staff->name}' created with role '" . Str::headline($role->name) . "'.");
    }

    public function updateStaff(Request $request, User $staff): RedirectResponse
    {
        if (! $staff->isStaff()) {
            abort(404);
        }

        $allowedRoles = Role::query()
            ->whereNotIn('name', [UserRole::Customer->value, UserRole::Supplier->value])
            ->pluck('name')
            ->all();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($staff->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', 'string', Rule::in($allowedRoles)],
            'password' => ['nullable', 'string', 'min:6'],
            'status' => ['required', 'in:active,suspended'],
        ]);

        // Prevent removing admin role from primary admin or current user locking themselves out
        if ($staff->email === 'admin@autosparts.com') {
            $validated['role'] = UserRole::Admin->value;
            $validated['status'] = 'active';
        }

        $updates = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'status' => $validated['status'],
        ];

        if (! empty($validated['password'])) {
            $updates['password'] = Hash::make($validated['password']);
        }

        $staff->update($updates);

        $role = Role::where('name', $validated['role'])->where('guard_name', 'web')->firstOrFail();
        $staff->syncRoles([$role]);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return back()->with('success', "Staff member '{$staff->name}' updated.");
    }

    public function destroyStaff(Request $request, User $staff): RedirectResponse
    {
        if (! $staff->isStaff()) {
            abort(404);
        }

        if ($staff->id === $request->user()->id || $staff->email === 'admin@autosparts.com') {
            return back()->with('error', 'Primary administrator or currently signed-in account cannot be deleted.');
        }

        $name = $staff->name;
        $staff->delete();

        return back()->with('success', "Staff member '{$name}' removed.");
    }

    private function ensureSidebarPermissionsExist(): void
    {
        foreach (UserPermission::values() as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }
    }
}
