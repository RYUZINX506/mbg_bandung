<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add sppg_id column to menu table if it doesn't exist
        if (Schema::hasTable('menu')) {
            Schema::table('menu', function (Blueprint $table) {
                if (!Schema::hasColumn('menu', 'sppg_id')) {
                    $table->foreignId('sppg_id')->nullable()->constrained('sppg')->onDelete('cascade')->after('id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu', function (Blueprint $table) {
            if (Schema::hasColumn('menu', 'sppg_id')) {
                $table->dropForeignKeyIfExists(['sppg_id']);
                $table->dropColumn('sppg_id');
            }
        });
    }
};
