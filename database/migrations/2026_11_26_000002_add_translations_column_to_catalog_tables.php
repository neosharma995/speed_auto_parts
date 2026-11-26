<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('products') && ! Schema::hasColumn('products', 'translations')) {
            Schema::table('products', function (Blueprint $table) {
                $table->json('translations')->nullable()->after('description');
            });
        }

        if (Schema::hasTable('categories') && ! Schema::hasColumn('categories', 'translations')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->json('translations')->nullable()->after('description');
            });
        }

        if (Schema::hasTable('brands') && ! Schema::hasColumn('brands', 'translations')) {
            Schema::table('brands', function (Blueprint $table) {
                $table->json('translations')->nullable()->after('description');
            });
        }
    }

    public function down(): void
    {
        foreach (['products', 'categories', 'brands'] as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'translations')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropColumn('translations');
                });
            }
        }
    }
};
