<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('orders')) {
            return;
        }

        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'stripe_session_id')) {
                $table->string('stripe_session_id')->nullable()->index()->after('delivery_status');
            }

            if (! Schema::hasColumn('orders', 'stripe_payment_intent_id')) {
                $table->string('stripe_payment_intent_id')->nullable()->index()->after('stripe_session_id');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('orders')) {
            return;
        }

        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'stripe_payment_intent_id')) {
                $table->dropColumn('stripe_payment_intent_id');
            }

            if (Schema::hasColumn('orders', 'stripe_session_id')) {
                $table->dropColumn('stripe_session_id');
            }
        });
    }
};
