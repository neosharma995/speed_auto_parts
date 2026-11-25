<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('phone');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('supplier_id')->nullable()->after('tax_class_id')->constrained('users')->nullOnDelete();
            $table->decimal('supplier_price', 10, 2)->nullable()->after('cost_price');
            $table->integer('supplier_stock')->default(0)->after('stock_quantity');
            $table->integer('warehouse_stock')->default(0)->after('supplier_stock');
        });

        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('lot_number', 50)->index();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('initiated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('direction', ['supplier_to_warehouse', 'warehouse_to_catalogue', 'catalogue_to_warehouse'])->index();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->enum('status', ['pending', 'received', 'rejected'])->default('pending')->index();
            $table->text('notes')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transfers');

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropColumn(['supplier_id', 'supplier_price', 'supplier_stock', 'warehouse_stock']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('company_name');
        });
    }
};
