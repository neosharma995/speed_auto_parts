<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('supplier_profiles')) {
            Schema::create('supplier_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
                $table->enum('approval_status', ['pending', 'invited', 'approved', 'rejected'])->default('approved')->index();
                $table->string('invitation_token', 80)->nullable()->index();
                $table->timestamp('invited_at')->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

                // Company, Country, Tax & Contacts
                $table->string('country_code', 5)->default('AE');
                $table->string('country_name', 100)->default('United Arab Emirates');
                $table->string('tax_id', 100)->nullable();
                $table->string('registration_number', 100)->nullable();
                $table->string('website')->nullable();
                $table->text('address')->nullable();
                $table->string('secondary_contact_name')->nullable();
                $table->string('secondary_contact_email')->nullable();
                $table->string('secondary_contact_phone', 40)->nullable();

                // Commercial Terms, Discounts & Purchasing Conditions
                $table->string('payment_terms', 100)->default('Net 30');
                $table->decimal('default_discount_percent', 5, 2)->default(0.00);
                $table->decimal('minimum_order_value', 10, 2)->default(0.00);
                $table->string('currency_code', 10)->default('AED');
                $table->text('commercial_conditions')->nullable();

                // Shipping, Transportation & Returns
                $table->string('shipping_methods')->nullable();
                $table->decimal('default_shipping_cost', 10, 2)->default(0.00);
                $table->unsignedInteger('lead_time_days')->default(3);
                $table->text('return_policy')->nullable();
                $table->text('warranty_terms')->nullable();

                // Reliability & Priority
                $table->decimal('reliability_score', 5, 2)->default(85.00);
                $table->unsignedInteger('priority_rank')->default(50);
                $table->boolean('is_preferred')->default(false);
                $table->text('admin_notes')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('supplier_documents')) {
            Schema::create('supplier_documents', function (Blueprint $table) {
                $table->id();
                $table->foreignId('supplier_id')->constrained('users')->cascadeOnDelete();
                $table->string('title');
                $table->string('document_type', 50)->default('other'); // trade_license, tax_certificate, agreement, catalog, insurance, other
                $table->string('file_path');
                $table->string('original_name');
                $table->unsignedBigInteger('file_size')->default(0);
                $table->date('expires_at')->nullable();
                $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('supplier_offers')) {
            Schema::create('supplier_offers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignId('supplier_id')->constrained('users')->cascadeOnDelete();
                $table->string('supplier_sku', 100)->nullable()->index();
                $table->decimal('purchase_price', 10, 2);
                $table->string('currency_code', 10)->default('AED');
                $table->unsignedInteger('stock_quantity')->default(0);
                $table->unsignedInteger('preparation_days')->default(1);
                $table->unsignedInteger('delivery_days')->default(3);
                $table->decimal('shipping_cost', 10, 2)->default(0.00);
                $table->decimal('commercial_discount_percent', 5, 2)->default(0.00);
                $table->string('commercial_terms', 255)->nullable();
                $table->decimal('reliability_score', 5, 2)->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->boolean('is_selected')->default(false)->index();
                $table->boolean('is_manual_override')->default(false);
                $table->decimal('calculated_score', 6, 2)->nullable();
                $table->timestamp('last_synced_at')->nullable();
                $table->timestamps();

                $table->unique(['product_id', 'supplier_id']);
            });
        }

        if (! Schema::hasTable('supplier_connectors')) {
            Schema::create('supplier_connectors', function (Blueprint $table) {
                $table->id();
                $table->foreignId('supplier_id')->constrained('users')->cascadeOnDelete();
                $table->string('name');
                $table->string('driver', 50)->default('rest_json'); // rest_json, xml_feed, mock_b2b
                $table->string('endpoint_url')->nullable();
                $table->string('auth_type', 30)->default('none'); // none, api_key, bearer, basic
                $table->text('credentials_json')->nullable();
                $table->json('field_mapping_json')->nullable();
                $table->string('sync_frequency', 30)->default('manual'); // manual, hourly, daily
                $table->boolean('is_active')->default(true);
                $table->timestamp('last_synced_at')->nullable();
                $table->string('last_status', 30)->nullable();
                $table->text('last_message')->nullable();
                $table->unsignedInteger('last_items_synced')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('supplier_import_logs')) {
            Schema::create('supplier_import_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('supplier_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('connector_id')->nullable()->constrained('supplier_connectors')->nullOnDelete();
                $table->string('source_type', 20); // csv, xml, xlsx, connector
                $table->string('filename')->nullable();
                $table->unsignedInteger('total_rows')->default(0);
                $table->unsignedInteger('imported_rows')->default(0);
                $table->unsignedInteger('updated_rows')->default(0);
                $table->unsignedInteger('failed_rows')->default(0);
                $table->string('status', 30)->default('completed');
                $table->text('error_summary')->nullable();
                $table->foreignId('initiated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('regional_pricing_rules')) {
            Schema::create('regional_pricing_rules', function (Blueprint $table) {
                $table->id();
                $table->string('country_code', 5)->unique();
                $table->string('country_name', 100);
                $table->string('currency_code', 10)->default('AED');
                $table->decimal('margin_percent', 6, 2)->default(0.00);
                $table->decimal('tax_rate_percent', 5, 2)->default(5.00);
                $table->decimal('flat_shipping_cost', 10, 2)->default(0.00);
                $table->decimal('free_shipping_threshold', 10, 2)->default(500.00);
                $table->decimal('min_order_amount', 10, 2)->default(0.00);
                $table->boolean('is_selling_enabled')->default(true);
                $table->boolean('is_default')->default(false);
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('regional_pricing_rules');
        Schema::dropIfExists('supplier_import_logs');
        Schema::dropIfExists('supplier_connectors');
        Schema::dropIfExists('supplier_offers');
        Schema::dropIfExists('supplier_documents');
        Schema::dropIfExists('supplier_profiles');
    }
};
