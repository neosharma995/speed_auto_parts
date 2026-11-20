<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVehicle;
use App\Models\Vehicle;
use Illuminate\Support\Collection;

class VehicleFitmentService
{
    /**
     * Get distinct years available in catalog.
     */
    public function getYears(): Collection
    {
        return Vehicle::query()
            ->select('year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year');
    }

    /**
     * Get distinct makes for a selected year.
     */
    public function getMakesForYear(int $year): Collection
    {
        return Vehicle::query()
            ->where('year', $year)
            ->select('make')
            ->distinct()
            ->orderBy('make')
            ->pluck('make');
    }

    /**
     * Get distinct models for a selected make and year.
     */
    public function getModelsForMakeAndYear(string $make, int $year): Collection
    {
        return Vehicle::query()
            ->where('year', $year)
            ->where('make', $make)
            ->select('model')
            ->distinct()
            ->orderBy('model')
            ->pluck('model');
    }

    /**
     * Get distinct engines for a selected model, make and year.
     */
    public function getEngines(string $make, string $model, int $year): Collection
    {
        return Vehicle::query()
            ->where('year', $year)
            ->where('make', $make)
            ->where('model', $model)
            ->select('id', 'engine', 'submodel')
            ->orderBy('engine')
            ->get();
    }

    /**
     * Check if a product fits a vehicle.
     */
    public function checkFitment(int $productId, int $vehicleId, ?int $variationId = null): array
    {
        $query = ProductVehicle::where('product_id', $productId)
            ->where('vehicle_id', $vehicleId);

        if ($variationId) {
            $variationMatch = (clone $query)->where('product_variation_id', $variationId)->first();
            if ($variationMatch) {
                return [
                    'compatible' => true,
                    'notes' => $variationMatch->notes,
                    'position' => $variationMatch->position,
                ];
            }
        }

        // Product-level fitment (where variation_id is null, meaning it fits all variations)
        $productMatch = $query->whereNull('product_variation_id')->first();

        if ($productMatch) {
            return [
                'compatible' => true,
                'notes' => $productMatch->notes,
                'position' => $productMatch->position,
            ];
        }

        return [
            'compatible' => false,
            'notes' => 'This part is not verified for the selected vehicle.',
            'position' => null,
        ];
    }
}
