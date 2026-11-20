<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Vehicle;
use Tests\TestCase;

class VehicleFitmentTest extends TestCase
{
    public function test_vehicle_years_api_returns_json(): void
    {
        $response = $this->getJson('/api/vehicles/years');
        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'years']);
    }

    public function test_vehicle_makes_api_returns_json_for_year(): void
    {
        $vehicle = Vehicle::first();
        $this->assertNotNull($vehicle);

        $response = $this->getJson("/api/vehicles/makes?year={$vehicle->year}");
        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'makes']);
    }

    public function test_vehicle_models_api_returns_json_for_make(): void
    {
        $vehicle = Vehicle::first();

        $response = $this->getJson("/api/vehicles/models?year={$vehicle->year}&make=" . urlencode($vehicle->make));
        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'models']);
    }

    public function test_vehicle_engines_api_returns_json_for_model(): void
    {
        $vehicle = Vehicle::first();

        $response = $this->getJson("/api/vehicles/engines?year={$vehicle->year}&make=" . urlencode($vehicle->make) . "&model=" . urlencode($vehicle->model));
        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'engines']);
    }

    public function test_user_can_select_and_clear_active_vehicle(): void
    {
        $vehicle = Vehicle::first();

        $selectResponse = $this->post('/vehicles/select', [
            'vehicle_id' => $vehicle->id,
        ]);
        $selectResponse->assertSessionHas('active_vehicle');

        $clearResponse = $this->post('/vehicles/clear');
        $clearResponse->assertSessionMissing('active_vehicle');
    }
}
