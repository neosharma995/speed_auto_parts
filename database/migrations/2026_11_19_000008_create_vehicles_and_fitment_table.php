<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('year')->index();
            $table->string('make', 60)->index();
            $table->string('model', 80)->index();
            $table->string('submodel', 80)->nullable();
            $table->string('engine', 100)->index();
            $table->string('engine_size', 30)->nullable();
            $table->string('fuel_type', 30)->default('Petrol');
            $table->string('transmission', 50)->nullable();
            $table->string('body_type', 50)->nullable();
            $table->timestamps();

            $table->index(['year', 'make', 'model']);
            $table->index(['make', 'model', 'year', 'engine']);
        });

        Schema::create('product_vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_variation_id')->nullable()->constrained('product_variations')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->string('notes')->nullable();
            $table->string('position')->nullable(); // Front, Rear, All
            $table->timestamps();

            $table->unique(['product_id', 'product_variation_id', 'vehicle_id'], 'prod_var_veh_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_vehicles');
        Schema::dropIfExists('vehicles');
    }
};
