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
        Schema::create('kecamatan', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kecamatan');
            $table->string('kode_kecamatan')->unique();
        });

        Schema::create('status_program', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
        });

        Schema::create('satuan', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
        });

        Schema::create('jenis_dapur', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
        });

        Schema::create('fasilitas_dapur', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
        });

        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->enum('role', ['sppg', 'sekolah', 'admin', 'ahli_gizi']);
        });

        Schema::create('supplier', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('kategori')->nullable();
            $table->text('alamat')->nullable();
            $table->foreignId('kecamatan_id')->nullable()->constrained('kecamatan')->nullOnDelete();
            $table->text('deskripsi')->nullable();
            $table->string('contact_person')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
        });

        Schema::create('bahanbaku', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('ketersediaan')->nullable();
            $table->string('kategori')->nullable();
            $table->decimal('harga_satuan', 15, 2)->nullable();
            $table->foreignId('supplier_id')->nullable()->constrained('supplier')->nullOnDelete();
            $table->foreignId('satuan_id')->nullable()->constrained('satuan')->nullOnDelete();
            $table->text('deskripsi')->nullable();
        });

        Schema::create('kelompok', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('kode')->unique();
            $table->string('tipe')->nullable();
            $table->string('nib_hukum')->nullable();
            $table->text('deskripsi')->nullable();
            $table->foreignId('kecamatan_id')->nullable()->constrained('kecamatan')->nullOnDelete();
            $table->text('alamat')->nullable();
            $table->string('desa')->nullable();
            $table->string('nama_ketua')->nullable();
            $table->string('no_telepon_ketua')->nullable();
            $table->string('email_ketua')->nullable();
            $table->unsignedInteger('jumlah_anggota')->nullable();
            $table->text('visi_misi')->nullable();
            $table->foreignId('status_program_id')->nullable()->constrained('status_program')->nullOnDelete();
            $table->date('tanggal_bergabung')->nullable();
            $table->text('catatan')->nullable();
        });

        Schema::create('sekolah', function (Blueprint $table) {
            $table->id();
            $table->string('nama_sekolah');
            $table->foreignId('kecamatan_id')->nullable()->constrained('kecamatan')->nullOnDelete();
            $table->text('alamat')->nullable();
            $table->string('desa_kelurahan')->nullable();
            $table->string('jenis_sekolah')->nullable();
            $table->unsignedInteger('total_siswa')->nullable();
            $table->string('nama_kepala_sekolah')->nullable();
            $table->string('no_telepon_kepala_sekolah')->nullable();
            $table->string('email')->nullable();
            $table->string('no_telepon')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->foreignId('status_program_id')->nullable()->constrained('status_program')->nullOnDelete();
            $table->date('tanggal_bergabung')->nullable();
            $table->text('catatan')->nullable();
        });

        Schema::create('sppg', function (Blueprint $table) {
            $table->id();
            $table->string('nama_sppg');
            $table->string('kode_sppg')->unique();
            $table->foreignId('kecamatan_id')->nullable()->constrained('kecamatan')->nullOnDelete();
            $table->text('alamat')->nullable();
            $table->string('desa_kelurahan')->nullable();
            $table->string('nama_pengelola')->nullable();
            $table->string('no_telepon_pengelola')->nullable();
            $table->string('email_pengelola')->nullable();
            $table->unsignedInteger('kapasitas_harian')->nullable();
            $table->string('fasilitas_dapur')->nullable();
            $table->string('status_operasional')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->date('mulai_operasional')->nullable();
            $table->unsignedInteger('jumlah_staf')->nullable();
            $table->text('catatan')->nullable();
            $table->foreignId('bahanbaku_id')->nullable()->constrained('bahanbaku')->nullOnDelete();
            $table->foreignId('ahli_gizi_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('jenis_dapur_id')->nullable()->constrained('jenis_dapur')->nullOnDelete();
            $table->string('sertifikat')->nullable();
        });

        Schema::create('laporan_sekolah', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sekolah_id')->constrained('sekolah')->cascadeOnDelete();
            $table->date('tanggal');
            $table->unsignedInteger('jumlah_penerima')->nullable();
            $table->unsignedInteger('jumlah_dikonsumsi')->nullable();
            $table->unsignedInteger('sisa')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('laporan_lokasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laporan_sekolah_id')->constrained('laporan_sekolah')->cascadeOnDelete();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('akurasi', 8, 2)->nullable();
            $table->text('alamat')->nullable();
        });

        Schema::create('file_path', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laporan_sekolah_id')->constrained('laporan_sekolah')->cascadeOnDelete();
            $table->string('jenis')->nullable();
            $table->string('file');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('laporan_sppg', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sppg_id')->constrained('sppg')->cascadeOnDelete();
            $table->foreignId('sekolah_id')->constrained('sekolah')->cascadeOnDelete();
            $table->foreignId('bahan_baku_id')->nullable()->constrained('bahanbaku')->nullOnDelete();
            $table->date('tanggal');
            $table->unsignedInteger('porsi_distribusi')->nullable();
            $table->unsignedInteger('kalori')->nullable();
            $table->unsignedInteger('protein')->nullable();
            $table->unsignedInteger('karbo')->nullable();
            $table->unsignedInteger('lemak')->nullable();
            $table->string('status_delivery')->nullable();
            $table->string('status_terkirim')->nullable();
            $table->foreignId('distributed_by')->nullable()->constrained('users')->nullOnDelete();
        });

        Schema::create('menu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('distribusi_id')->constrained('laporan_sppg')->cascadeOnDelete();
            $table->string('code')->nullable();
            $table->text('deskripsi')->nullable();
            $table->string('kategori')->nullable();
            $table->unsignedInteger('kalori')->nullable();
            $table->unsignedInteger('protein')->nullable();
            $table->unsignedInteger('karbohidrat')->nullable();
            $table->unsignedInteger('lemak')->nullable();
            $table->unsignedInteger('jumlah')->nullable();
        });

        Schema::create('pengaduan', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->enum('jenis_pelapor', ['individu', 'sekolah', 'sppg']);
            $table->text('pesan');
            $table->date('tanggal_kirim');
            $table->string('status')->nullable();
            $table->string('no_telepon')->nullable();
            $table->string('tujuan')->nullable();
            $table->string('sekolah')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaduan');
        Schema::dropIfExists('menu');
        Schema::dropIfExists('laporan_sppg');
        Schema::dropIfExists('file_path');
        Schema::dropIfExists('laporan_lokasi');
        Schema::dropIfExists('laporan_sekolah');
        Schema::dropIfExists('sppg');
        Schema::dropIfExists('sekolah');
        Schema::dropIfExists('kelompok');
        Schema::dropIfExists('bahanbaku');
        Schema::dropIfExists('supplier');
        Schema::dropIfExists('user_profiles');
        Schema::dropIfExists('fasilitas_dapur');
        Schema::dropIfExists('jenis_dapur');
        Schema::dropIfExists('satuan');
        Schema::dropIfExists('status_program');
        Schema::dropIfExists('kecamatan');
    }
};
