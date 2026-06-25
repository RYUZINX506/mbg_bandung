<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan_sppg', function (Blueprint $table): void {
            if (! Schema::hasColumn('laporan_sppg', 'keterangan')) {
                $table->text('keterangan')->nullable()->after('menu_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('laporan_sppg', function (Blueprint $table): void {
            if (Schema::hasColumn('laporan_sppg', 'keterangan')) {
                $table->dropColumn('keterangan');
            }
        });
    }
};
