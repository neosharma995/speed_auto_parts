<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Mail\SupplierInvitationMail;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\SupplierConnector;
use App\Models\SupplierDocument;
use App\Models\SupplierImportLog;
use App\Models\SupplierProfile;
use App\Models\User;
use App\Services\Connectors\SupplierConnectorManager;
use App\Services\SupplierSelectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class SupplierController extends Controller
{
    public function __construct(
        protected SupplierSelectionService $selectionService,
        protected SupplierConnectorManager $connectorManager
    ) {}

    public function index(Request $request): Response
    {
        $query = User::query()
            ->whereHas('roles', fn ($q) => $q->where('name', UserRole::Supplier->value))
            ->with(['supplierProfile', 'supplierDocuments'])
            ->withCount([
                'suppliedProducts',
                'supplierOffers',
                'supplierDocuments',
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

        $allSuppliers = User::query()
            ->whereHas('roles', fn ($q) => $q->where('name', UserRole::Supplier->value))
            ->with('supplierProfile')
            ->orderBy('company_name')
            ->get(['id', 'name', 'company_name', 'email', 'status']);

        $pendingLots = StockTransfer::query()
            ->where('direction', 'supplier_to_warehouse')
            ->where('status', 'pending')
            ->with(['product.brand', 'product.category', 'supplier'])
            ->latest()
            ->get();

        // Multi-supplier offer comparisons per product
        $productsWithOffers = Product::query()
            ->with(['brand', 'category'])
            ->orderBy('name')
            ->get();

        $offerComparisons = $productsWithOffers->map(function (Product $product) {
            $compared = $this->selectionService->compareOffersForProduct($product);

            return [
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'part_number' => $product->part_number,
                    'base_price' => (float) $product->base_price,
                    'effective_price' => (float) ($product->effective_price ?: $product->base_price),
                    'status' => $product->status,
                ],
                'offers' => $compared->map(fn ($row) => [
                    'id' => $row['offer']->id,
                    'supplier_id' => $row['offer']->supplier_id,
                    'supplier_name' => $row['offer']->supplier?->company_name ?: $row['offer']->supplier?->name,
                    'supplier_sku' => $row['offer']->supplier_sku,
                    'purchase_price' => (float) $row['offer']->purchase_price,
                    'currency_code' => $row['offer']->currency_code,
                    'shipping_cost' => (float) $row['offer']->shipping_cost,
                    'commercial_discount_percent' => (float) $row['offer']->commercial_discount_percent,
                    'commercial_terms' => $row['offer']->commercial_terms,
                    'landed_cost' => $row['landed_cost'],
                    'stock_quantity' => (int) $row['offer']->stock_quantity,
                    'preparation_days' => (int) $row['offer']->preparation_days,
                    'delivery_days' => (int) $row['offer']->delivery_days,
                    'lead_days' => $row['lead_days'],
                    'reliability' => $row['reliability'],
                    'priority_rank' => $row['priority_rank'],
                    'is_preferred' => $row['is_preferred'],
                    'margin_amount' => $row['margin_amount'],
                    'margin_percent' => $row['margin_percent'],
                    'score' => $row['score'],
                    'breakdown' => $row['breakdown'],
                    'is_selected' => (bool) $row['offer']->is_selected,
                    'is_manual_override' => (bool) $row['offer']->is_manual_override,
                ])->values(),
            ];
        })->values();

        $connectors = SupplierConnector::query()
            ->with('supplier:id,name,company_name')
            ->latest()
            ->get();

        $importLogs = SupplierImportLog::query()
            ->with(['supplier:id,name,company_name', 'connector:id,name'])
            ->latest()
            ->take(25)
            ->get();

        $allowedTabs = ['suppliers', 'incoming', 'offers', 'imports', 'connectors'];
        $requestedTab = (string) $request->query('tab', 'suppliers');
        $activeTab = in_array($requestedTab, $allowedTabs, true) ? $requestedTab : 'suppliers';

        return Inertia::render('Admin/Suppliers/Index', [
            'suppliers' => $suppliers,
            'allSuppliers' => $allSuppliers,
            'pendingLots' => $pendingLots,
            'transfersCount' => StockTransfer::query()->count(),
            'activeTab' => $activeTab,
            'filters' => (object) $request->only(['search']),
            'offerComparisons' => $offerComparisons,
            'selectionRules' => $this->selectionService->getRules(),
            'connectors' => $connectors,
            'connectorDrivers' => $this->connectorManager->availableDrivers(),
            'importLogs' => $importLogs,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['nullable', 'string', 'min:6'],
            'send_invitation' => ['boolean'],
            'approval_status' => ['nullable', 'in:pending,invited,approved,rejected'],
            'country_code' => ['nullable', 'string', 'max:5'],
            'country_name' => ['nullable', 'string', 'max:100'],
            'tax_id' => ['nullable', 'string', 'max:100'],
            'registration_number' => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'secondary_contact_name' => ['nullable', 'string', 'max:150'],
            'secondary_contact_email' => ['nullable', 'email', 'max:150'],
            'secondary_contact_phone' => ['nullable', 'string', 'max:40'],
            'payment_terms' => ['nullable', 'string', 'max:100'],
            'default_discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'minimum_order_value' => ['nullable', 'numeric', 'min:0'],
            'currency_code' => ['nullable', 'in:AED,USD,EUR'],
            'commercial_conditions' => ['nullable', 'string', 'max:2000'],
            'shipping_methods' => ['nullable', 'string', 'max:255'],
            'default_shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'lead_time_days' => ['nullable', 'integer', 'min:1', 'max:120'],
            'return_policy' => ['nullable', 'string', 'max:2000'],
            'warranty_terms' => ['nullable', 'string', 'max:2000'],
            'reliability_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'priority_rank' => ['nullable', 'integer', 'min:1', 'max:100'],
            'is_preferred' => ['boolean'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $plainPassword = ! empty($validated['password']) ? $validated['password'] : Str::random(12);
        $isInvite = (bool) ($validated['send_invitation'] ?? false);
        $approvalStatus = $validated['approval_status'] ?? ($isInvite ? 'invited' : 'approved');

        $supplier = User::create([
            'name' => $validated['name'],
            'company_name' => $validated['company_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($plainPassword),
            'email_verified_at' => now(),
            'status' => $approvalStatus === 'approved' ? 'active' : 'suspended',
        ]);

        $supplierRole = Role::firstOrCreate(['name' => UserRole::Supplier->value, 'guard_name' => 'web']);
        $supplier->syncRoles([$supplierRole]);

        SupplierProfile::create([
            'user_id' => $supplier->id,
            'approval_status' => $approvalStatus,
            'invitation_token' => $isInvite ? Str::random(40) : null,
            'invited_at' => $isInvite ? now() : null,
            'approved_at' => $approvalStatus === 'approved' ? now() : null,
            'approved_by' => $approvalStatus === 'approved' ? $request->user()?->id : null,
            'country_code' => strtoupper($validated['country_code'] ?? 'AE'),
            'country_name' => $validated['country_name'] ?? 'United Arab Emirates',
            'tax_id' => $validated['tax_id'] ?? null,
            'registration_number' => $validated['registration_number'] ?? null,
            'website' => $validated['website'] ?? null,
            'address' => $validated['address'] ?? null,
            'secondary_contact_name' => $validated['secondary_contact_name'] ?? null,
            'secondary_contact_email' => $validated['secondary_contact_email'] ?? null,
            'secondary_contact_phone' => $validated['secondary_contact_phone'] ?? null,
            'payment_terms' => $validated['payment_terms'] ?? 'Net 30',
            'default_discount_percent' => $validated['default_discount_percent'] ?? 0,
            'minimum_order_value' => $validated['minimum_order_value'] ?? 0,
            'currency_code' => strtoupper($validated['currency_code'] ?? 'AED'),
            'commercial_conditions' => $validated['commercial_conditions'] ?? null,
            'shipping_methods' => $validated['shipping_methods'] ?? 'Standard Courier',
            'default_shipping_cost' => $validated['default_shipping_cost'] ?? 0,
            'lead_time_days' => $validated['lead_time_days'] ?? 3,
            'return_policy' => $validated['return_policy'] ?? null,
            'warranty_terms' => $validated['warranty_terms'] ?? null,
            'reliability_score' => $validated['reliability_score'] ?? 85,
            'priority_rank' => $validated['priority_rank'] ?? 50,
            'is_preferred' => (bool) ($validated['is_preferred'] ?? false),
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

        if ($isInvite) {
            try {
                Mail::to($supplier->email)->send(new SupplierInvitationMail($supplier, 'invited', $plainPassword));
            } catch (\Throwable $e) {
                Log::warning('Supplier invitation email failed: ' . $e->getMessage());
            }
        }

        return back()->with(
            'success',
            $isInvite
                ? "Supplier '{$supplier->company_name}' invited and credentials emailed."
                : "Supplier '{$supplier->company_name}' added successfully."
        );
    }

    public function update(Request $request, User $supplier): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($supplier->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'status' => ['required', 'in:active,suspended'],
            'password' => ['nullable', 'string', 'min:6'],
            'approval_status' => ['nullable', 'in:pending,invited,approved,rejected'],
            'country_code' => ['nullable', 'string', 'max:5'],
            'country_name' => ['nullable', 'string', 'max:100'],
            'tax_id' => ['nullable', 'string', 'max:100'],
            'registration_number' => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'secondary_contact_name' => ['nullable', 'string', 'max:150'],
            'secondary_contact_email' => ['nullable', 'email', 'max:150'],
            'secondary_contact_phone' => ['nullable', 'string', 'max:40'],
            'payment_terms' => ['nullable', 'string', 'max:100'],
            'default_discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'minimum_order_value' => ['nullable', 'numeric', 'min:0'],
            'currency_code' => ['nullable', 'in:AED,USD,EUR'],
            'commercial_conditions' => ['nullable', 'string', 'max:2000'],
            'shipping_methods' => ['nullable', 'string', 'max:255'],
            'default_shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'lead_time_days' => ['nullable', 'integer', 'min:1', 'max:120'],
            'return_policy' => ['nullable', 'string', 'max:2000'],
            'warranty_terms' => ['nullable', 'string', 'max:2000'],
            'reliability_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'priority_rank' => ['nullable', 'integer', 'min:1', 'max:100'],
            'is_preferred' => ['boolean'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $supplier->name = $validated['name'];
        $supplier->company_name = $validated['company_name'];
        $supplier->email = $validated['email'];
        $supplier->phone = $validated['phone'] ?? null;
        $supplier->status = $validated['status'];

        if (! empty($validated['password'])) {
            $supplier->password = Hash::make($validated['password']);
        }
        $supplier->save();

        SupplierProfile::updateOrCreate(
            ['user_id' => $supplier->id],
            [
                'approval_status' => $validated['approval_status'] ?? ($supplier->supplierProfile?->approval_status ?? 'approved'),
                'country_code' => strtoupper($validated['country_code'] ?? 'AE'),
                'country_name' => $validated['country_name'] ?? 'United Arab Emirates',
                'tax_id' => $validated['tax_id'] ?? null,
                'registration_number' => $validated['registration_number'] ?? null,
                'website' => $validated['website'] ?? null,
                'address' => $validated['address'] ?? null,
                'secondary_contact_name' => $validated['secondary_contact_name'] ?? null,
                'secondary_contact_email' => $validated['secondary_contact_email'] ?? null,
                'secondary_contact_phone' => $validated['secondary_contact_phone'] ?? null,
                'payment_terms' => $validated['payment_terms'] ?? 'Net 30',
                'default_discount_percent' => $validated['default_discount_percent'] ?? 0,
                'minimum_order_value' => $validated['minimum_order_value'] ?? 0,
                'currency_code' => strtoupper($validated['currency_code'] ?? 'AED'),
                'commercial_conditions' => $validated['commercial_conditions'] ?? null,
                'shipping_methods' => $validated['shipping_methods'] ?? 'Standard Courier',
                'default_shipping_cost' => $validated['default_shipping_cost'] ?? 0,
                'lead_time_days' => $validated['lead_time_days'] ?? 3,
                'return_policy' => $validated['return_policy'] ?? null,
                'warranty_terms' => $validated['warranty_terms'] ?? null,
                'reliability_score' => $validated['reliability_score'] ?? 85,
                'priority_rank' => $validated['priority_rank'] ?? 50,
                'is_preferred' => (bool) ($validated['is_preferred'] ?? false),
                'admin_notes' => $validated['admin_notes'] ?? null,
            ]
        );

        $this->selectionService->recalculateAll();

        return back()->with('success', "Supplier '{$supplier->company_name}' updated.");
    }

    public function approve(Request $request, User $supplier): RedirectResponse
    {
        $supplier->update(['status' => 'active']);

        SupplierProfile::updateOrCreate(
            ['user_id' => $supplier->id],
            [
                'approval_status' => 'approved',
                'approved_at' => now(),
                'approved_by' => $request->user()?->id,
            ]
        );

        try {
            Mail::to($supplier->email)->send(new SupplierInvitationMail($supplier, 'approved'));
        } catch (\Throwable $e) {
            Log::warning('Supplier approval email failed: ' . $e->getMessage());
        }

        return back()->with('success', "Supplier '{$supplier->company_name}' approved and notified.");
    }

    public function reject(User $supplier): RedirectResponse
    {
        $supplier->update(['status' => 'suspended']);

        SupplierProfile::updateOrCreate(
            ['user_id' => $supplier->id],
            ['approval_status' => 'rejected']
        );

        try {
            Mail::to($supplier->email)->send(new SupplierInvitationMail($supplier, 'rejected'));
        } catch (\Throwable $e) {
            Log::warning('Supplier rejection email failed: ' . $e->getMessage());
        }

        return back()->with('success', "Supplier '{$supplier->company_name}' marked as rejected.");
    }

    public function uploadDocument(Request $request, User $supplier): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'document_type' => ['required', 'in:trade_license,tax_certificate,agreement,catalog,insurance,other'],
            'document_file' => ['required', 'file', 'max:10240'],
            'expires_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $file = $request->file('document_file');
        $storedPath = $file->store('supplier-documents', 'public');

        SupplierDocument::create([
            'supplier_id' => $supplier->id,
            'title' => $validated['title'],
            'document_type' => $validated['document_type'],
            'file_path' => $storedPath,
            'original_name' => $file->getClientOriginalName(),
            'file_size' => (int) $file->getSize(),
            'expires_at' => $validated['expires_at'] ?? null,
            'uploaded_by' => $request->user()?->id,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', "Document '{$validated['title']}' uploaded.");
    }

    public function deleteDocument(SupplierDocument $document): RedirectResponse
    {
        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Supplier document deleted.');
    }

    public function destroy(User $supplier): RedirectResponse
    {
        $name = $supplier->company_name ?: $supplier->name;
        $supplier->delete();

        return back()->with('success', "Supplier '{$name}' removed.");
    }
}
