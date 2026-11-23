<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. Standard Autos Parts GST 18%, Performance Spares GST 28%
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('tax_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tax_class_id')->constrained('tax_classes')->cascadeOnDelete();
            $table->string('name'); // e.g. GST 18% (9% CGST + 9% SGST)
            $table->decimal('rate', 5, 2)->default(18.00); // Total %
            $table->decimal('cgst_rate', 5, 2)->default(9.00);
            $table->decimal('sgst_rate', 5, 2)->default(9.00);
            $table->decimal('igst_rate', 5, 2)->default(18.00);
            $table->string('country_code', 3)->default('IN');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_rates');
        Schema::dropIfExists('tax_classes');
    }
};
