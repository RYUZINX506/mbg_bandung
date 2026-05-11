<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE user_profiles MODIFY role ENUM('sppg', 'sekolah', 'admin', 'ahli_gizi', 'superadmin') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE user_profiles MODIFY role ENUM('sppg', 'sekolah', 'admin', 'ahli_gizi') NOT NULL");
    }
};