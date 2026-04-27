<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->foreignId('sekolah_id')->nullable()->after('role')->constrained('sekolah')->nullOnDelete();
            $table->foreignId('sppg_id')->nullable()->after('sekolah_id')->constrained('sppg')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('sppg_id');
            $table->dropConstrainedForeignId('sekolah_id');
        });
    }
};