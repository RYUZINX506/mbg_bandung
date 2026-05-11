<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            // Add sekolah/sppg integration constraints
            // Users with 'sekolah' role must have sekolah_id and no sppg_id
            $table->dropForeign('users_sppg_id_foreign');
            $table->dropForeign('users_sekolah_id_foreign');

            // Re-add foreign keys with cascade delete
            $table->foreign('sekolah_id')
                ->references('id')
                ->on('sekolah')
                ->cascadeOnDelete();

            $table->foreign('sppg_id')
                ->references('id')
                ->on('sppg')
                ->cascadeOnDelete();
        });

        // Add role-based check constraints to ensure proper integration
        // Note: Check constraints vary by database, this uses SQL for MySQL/MariaDB
        DB::statement('
            ALTER TABLE users
            ADD CONSTRAINT chk_sekolah_role_integration
            CHECK (
                (role = "sekolah" AND sekolah_id IS NOT NULL AND sppg_id IS NULL)
                OR (role != "sekolah" AND (sekolah_id IS NULL OR sppg_id IS NOT NULL))
                OR role IN ("admin", "superadmin")
            )
        ');

        DB::statement('
            ALTER TABLE users
            ADD CONSTRAINT chk_sppg_role_integration
            CHECK (
                (role IN ("sppg", "ahli_gizi") AND sppg_id IS NOT NULL AND sekolah_id IS NULL)
                OR (role NOT IN ("sppg", "ahli_gizi") AND (sppg_id IS NULL OR sekolah_id IS NOT NULL))
                OR role IN ("admin", "superadmin")
            )
        ');
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            DB::statement('ALTER TABLE users DROP CONSTRAINT chk_sekolah_role_integration');
            DB::statement('ALTER TABLE users DROP CONSTRAINT chk_sppg_role_integration');

            $table->dropForeign('users_sekolah_id_foreign');
            $table->dropForeign('users_sppg_id_foreign');

            $table->foreign('sekolah_id')
                ->references('id')
                ->on('sekolah')
                ->nullOnDelete();

            $table->foreign('sppg_id')
                ->references('id')
                ->on('sppg')
                ->nullOnDelete();
        });
    }
};
