<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductAttribute;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AttributeController extends Controller
{
    public function index(): Response
    {
        $attributes = ProductAttribute::query()
            ->with(['values'])
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Attributes/Index', [
            'attributes' => $attributes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:product_attributes,slug'],
            'description' => ['nullable', 'string'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        ProductAttribute::create($validated);

        return back()->with('success', "Attribute '{$validated['name']}' created successfully.");
    }

    public function destroy(ProductAttribute $attribute): RedirectResponse
    {
        $name = $attribute->name;
        $attribute->delete();

        return back()->with('success', "Attribute '{$name}' deleted.");
    }
}
