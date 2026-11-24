<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Vehicle::query()->withCount('productVehicles');

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('year', 'like', "%{$search}%")
                    ->orWhere('make', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('submodel', 'like', "%{$search}%")
                    ->orWhere('engine', 'like', "%{$search}%")
                    ->orWhere('fuel_type', 'like', "%{$search}%")
                    ->orWhere('transmission', 'like', "%{$search}%")
                    ->orWhere('body_type', 'like', "%{$search}%");
            });
        }

        if ($request->filled('make')) {
            $query->where('make', (string) $request->input('make'));
        }

        if ($request->filled('year')) {
            $query->where('year', (int) $request->input('year'));
        }

        $vehicles = $query
            ->orderBy('year', 'desc')
            ->orderBy('make')
            ->orderBy('model')
            ->orderBy('id', 'desc')
            ->paginate(8)
            ->withQueryString();

        return Inertia::render('Admin/Vehicles/Index', [
            'vehicles' => $vehicles,
            'makes' => Vehicle::query()->select('make')->distinct()->orderBy('make')->pluck('make'),
            'years' => Vehicle::query()->select('year')->distinct()->orderByDesc('year')->pluck('year'),
            'filters' => (object) $request->only(['search', 'make', 'year']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateVehicle($request);

        $vehicle = Vehicle::create($validated);

        return back()->with('success', "Vehicle '{$vehicle->display_name}' added to compatibility database.");
    }

    public function update(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $validated = $this->validateVehicle($request);

        $vehicle->update($validated);

        return back()->with('success', "Vehicle '{$vehicle->display_name}' updated successfully.");
    }

    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        $name = $vehicle->display_name;
        $vehicle->delete();

        return back()->with('success', "Vehicle '{$name}' removed.");
    }

    private function validateVehicle(Request $request): array
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:1970', 'max:2035'],
            'make' => ['required', 'string', 'max:60'],
            'model' => ['required', 'string', 'max:80'],
            'submodel' => ['nullable', 'string', 'max:80'],
            'engine' => ['required', 'string', 'max:100'],
            'engine_size' => ['nullable', 'string', 'max:30'],
            'fuel_type' => ['nullable', 'string', 'max:30'],
            'transmission' => ['nullable', 'string', 'max:50'],
            'body_type' => ['nullable', 'string', 'max:50'],
        ]);

        $validated['fuel_type'] = !empty($validated['fuel_type']) ? $validated['fuel_type'] : 'Petrol';

        return $validated;
    }
}
