<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('menu')) {
            return;
        }

        if (! Schema::hasColumn('menu', 'distribusi_id')) {
            return;
        }

        // Drop foreign key if exists, modify column to nullable, then re-add FK
        try {
            DB::statement('ALTER TABLE `menu` DROP FOREIGN KEY `menu_distribusi_id_foreign`');
        } catch (\Throwable $e) {
            // ignore if FK name differs or doesn't exist
        }

        DB::statement('ALTER TABLE `menu` MODIFY `distribusi_id` BIGINT UNSIGNED NULL');

        try {
            DB::statement('ALTER TABLE `menu` ADD CONSTRAINT `menu_distribusi_id_foreign` FOREIGN KEY (`distribusi_id`) REFERENCES `laporan_sppg` (`id`) ON DELETE CASCADE');
        } catch (\Throwable $e) {
            // ignore if already exists or cannot be added
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('menu')) {
            return;
        }

        if (! Schema::hasColumn('menu', 'distribusi_id')) {
            return;
        }

        try {
            DB::statement('ALTER TABLE `menu` DROP FOREIGN KEY `menu_distribusi_id_foreign`');
        } catch (\Throwable $e) {
            // ignore
        }

        DB::statement('ALTER TABLE `menu` MODIFY `distribusi_id` BIGINT UNSIGNED NOT NULL');

        try {
            DB::statement('ALTER TABLE `menu` ADD CONSTRAINT `menu_distribusi_id_foreign` FOREIGN KEY (`distribusi_id`) REFERENCES `laporan_sppg` (`id`) ON DELETE CASCADE');
        } catch (\Throwable $e) {
            // ignore
        }
    }
};
