<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('cms_pages') && ! Schema::hasColumn('cms_pages', 'sections')) {
            Schema::table('cms_pages', function (Blueprint $table) {
                $table->json('sections')->nullable()->after('translations');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('cms_pages') && Schema::hasColumn('cms_pages', 'sections')) {
            Schema::table('cms_pages', function (Blueprint $table) {
                $table->dropColumn('sections');
            });
        }
    }
};
