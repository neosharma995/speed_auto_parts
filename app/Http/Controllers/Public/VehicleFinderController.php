<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Services\VehicleFitmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleFinderController extends Controller
{
    public function __construct(
        protected VehicleFitmentService $fitmentService
    ) {}

    public function page(): Response
    {
        return Inertia::render('Public/VehicleFinderPage', [
            'activeVehicle' => session('active_vehicle'),
        ]);
    }

    public function getYears(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'years' => $this->fitmentService->getYears(),
        ]);
    }

    public function getMakes(Request $request): JsonResponse
    {
        $year = (int) $request->query('year');
        return response()->json([
            'success' => true,
            'makes' => $this->fitmentService->getMakesForYear($year),
        ]);
    }

    public function getModels(Request $request): JsonResponse
    {
        $year = (int) $request->query('year');
        $make = (string) $request->query('make');
        return response()->json([
            'success' => true,
            'models' => $this->fitmentService->getModelsForMakeAndYear($make, $year),
        ]);
    }

    public function getEngines(Request $request): JsonResponse
    {
        $year = (int) $request->query('year');
        $make = (string) $request->query('make');
        $model = (string) $request->query('model');
        return response()->json([
            'success' => true,
            'engines' => $this->fitmentService->getEngines($make, $model, $year),
        ]);
    }

    public function selectVehicle(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vehicle_id' => ['required', 'exists:vehicles,id'],
        ]);

        $vehicle = Vehicle::findOrFail($validated['vehicle_id']);

        $request->session()->put('active_vehicle', [
            'id' => $vehicle->id,
            'year' => $vehicle->year,
            'make' => $vehicle->make,
            'model' => $vehicle->model,
            'engine' => $vehicle->engine,
            'display_name' => $vehicle->display_name,
        ]);

        return back()->with('success', "Active vehicle set to {$vehicle->display_name}");
    }

    public function clearVehicle(Request $request): RedirectResponse
    {
        $request->session()->forget('active_vehicle');
        return back()->with('success', 'Active vehicle selection cleared.');
    }
}
