<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('sort_order')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:categories,slug'],
            'description' => ['nullable', 'string'],
            'translations' => ['nullable'],
            'image' => ['nullable', 'string'],
            'image_file' => ['nullable', 'image', 'max:4096'],
            'icon' => ['nullable', 'string'],
        ]);

        if (isset($validated['translations']) && is_string($validated['translations'])) {
            $decoded = json_decode($validated['translations'], true);
            $validated['translations'] = is_array($decoded) ? $decoded : null;
        }

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('categories', 'public');
            $validated['image'] = '/storage/' . $path;
        }
        unset($validated['image_file']);

        Category::create($validated);

        return back()->with('success', "Category '{$validated['name']}' created successfully.");
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', "unique:categories,slug,{$category->id}"],
            'description' => ['nullable', 'string'],
            'translations' => ['nullable'],
            'image' => ['nullable', 'string'],
            'image_file' => ['nullable', 'image', 'max:4096'],
            'icon' => ['nullable', 'string'],
        ]);

        if (isset($validated['translations']) && is_string($validated['translations'])) {
            $decoded = json_decode($validated['translations'], true);
            $validated['translations'] = is_array($decoded) ? $decoded : null;
        }

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('categories', 'public');
            $validated['image'] = '/storage/' . $path;
        }
        unset($validated['image_file']);

        $category->update($validated);

        return back()->with('success', "Category '{$category->name}' updated successfully.");
    }

    public function destroy(Category $category): RedirectResponse
    {
        $name = $category->name;
        $category->delete();

        return back()->with('success', "Category '{$name}' deleted.");
    }
}
