<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('kode')->nullable()->unique()->after('id');
            $table->string('role')->nullable()->after('password');
            $table->string('api_token', 80)->nullable()->unique()->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['kode']);
            $table->dropUnique(['api_token']);
            $table->dropColumn(['kode', 'role', 'api_token']);
        });
    }
};