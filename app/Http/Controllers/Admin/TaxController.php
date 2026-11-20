<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TaxClass;
use App\Models\TaxRate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TaxController extends Controller
{
    public function index(): Response
    {
        $taxClasses = TaxClass::query()
            ->with(['rates'])
            ->withCount('products')
            ->get();

        return Inertia::render('Admin/Taxes/Index', [
            'taxClasses' => $taxClasses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:tax_classes,slug'],
            'rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'cgst_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'sgst_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'igst_rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $taxClass = TaxClass::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => "GST Rate {$validated['rate']}%",
        ]);

        TaxRate::create([
            'tax_class_id' => $taxClass->id,
            'name' => "{$validated['name']} Rate",
            'rate' => $validated['rate'],
            'cgst_rate' => $validated['cgst_rate'],
            'sgst_rate' => $validated['sgst_rate'],
            'igst_rate' => $validated['igst_rate'],
            'country_code' => 'IN',
            'is_active' => true,
        ]);

        return back()->with('success', "Tax class '{$validated['name']}' created successfully.");
    }
}
