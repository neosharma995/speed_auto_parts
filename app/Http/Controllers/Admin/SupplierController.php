<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\StockTransfer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query()
            ->whereHas('roles', fn ($q) => $q->where('name', UserRole::Supplier->value))
            ->withCount([
                'suppliedProducts',
                'stockTransfers as pending_lots_count' => fn ($q) => $q
                    ->where('direction', 'supplier_to_warehouse')
                    ->where('status', 'pending'),
                'stockTransfers as received_lots_count' => fn ($q) => $q
                    ->where('direction', 'supplier_to_warehouse')
                    ->where('status', 'received'),
            ]);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->latest()->paginate(15)->withQueryString();

        $pendingLots = StockTransfer::query()
            ->where('direction', 'supplier_to_warehouse')
            ->where('status', 'pending')
            ->with(['product.brand', 'product.category', 'supplier'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Suppliers/Index', [
            'suppliers' => $suppliers,
            'pendingLots' => $pendingLots,
            'transfersCount' => StockTransfer::query()->count(),
            'activeTab' => $request->query('tab') === 'incoming' ? 'incoming' : 'suppliers',
            'filters' => (object) $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $supplier = User::create([
            'name' => $validated['name'],
            'company_name' => $validated['company_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);

        $supplierRole = Role::firstOrCreate(['name' => UserRole::Supplier->value, 'guard_name' => 'web']);
        $supplier->syncRoles([$supplierRole]);

        return back()->with('success', "Supplier '{$supplier->company_name}' added successfully.");
    }

    public function update(Request $request, User $supplier): RedirectResponse
    {
        if (! $supplier->isSupplier()) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', "unique:users,email,{$supplier->id}"],
            'phone' => ['nullable', 'string', 'max:30'],
            'status' => ['required', 'in:active,suspended'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'company_name' => $validated['company_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'status' => $validated['status'],
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $supplier->update($updateData);

        return back()->with('success', "Supplier '{$supplier->company_name}' updated.");
    }

    public function destroy(User $supplier): RedirectResponse
    {
        if (! $supplier->isSupplier()) {
            abort(404);
        }

        $label = $supplier->company_name ?: $supplier->name;
        $supplier->delete();

        return back()->with('success', "Supplier '{$label}' removed.");
    }
}
