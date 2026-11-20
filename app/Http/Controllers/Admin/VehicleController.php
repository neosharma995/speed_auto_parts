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
    public function index(): Response
    {
        $vehicles = Vehicle::query()
            ->withCount('productVehicles')
            ->orderBy('year', 'desc')
            ->orderBy('make')
            ->orderBy('model')
            ->get();

        return Inertia::render('Admin/Vehicles/Index', [
            'vehicles' => $vehicles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:1970', 'max:2030'],
            'make' => ['required', 'string', 'max:60'],
            'model' => ['required', 'string', 'max:80'],
            'submodel' => ['nullable', 'string', 'max:80'],
            'engine' => ['required', 'string', 'max:100'],
        ]);

        $vehicle = Vehicle::create($validated);

        return back()->with('success', "Vehicle '{$vehicle->display_name}' added to compatibility database.");
    }

    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        $name = $vehicle->display_name;
        $vehicle->delete();

        return back()->with('success', "Vehicle '{$name}' removed.");
    }
}
