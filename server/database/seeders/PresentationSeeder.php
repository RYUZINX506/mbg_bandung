<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class PresentationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear only SPPG, sekolah, laporan, and distribution data.
        DB::table('menu')->delete();
        DB::table('laporan_lokasi')->delete();
        DB::table('file_path')->delete();
        DB::table('laporan_sppg')->delete();
        DB::table('laporan_sekolah')->delete();
        DB::table('sppg')->delete();
        DB::table('sekolah')->delete();

        $kecamatan = DB::table('kecamatan')->where('nama_kecamatan', 'Bandung Wetan')->first()
            ?? DB::table('kecamatan')->first();
        $statusAktifId = DB::table('status_program')->where('nama', 'Aktif')->value('id') ?? null;
        $bahanBakuId = DB::table('bahanbaku')->where('nama', 'Beras Premium')->value('id') ?? null;
        $jenisDapurId = DB::table('jenis_dapur')->where('nama', 'Dapur Satelit Modular')->value('id') ?? null;
        DB::table('roles')->updateOrInsert(
            ['code' => 'presentation'],
            [
                'code' => 'presentation',
                'label' => 'Demo Operasional',
                'description' => 'Preset data tunggal untuk demo aplikasi.',
                'sort_order' => 99,
            ]
        );

        User::query()->updateOrCreate(
            ['kode' => 'MBG-ADMIN-01'],
            [
                'name' => 'Admin MBG Bandung',
                'email' => 'admin@mbg.test',
                'role' => 'admin',
                'password' => Hash::make('password'),
                'sppg_id' => null,
                'sekolah_id' => null,
            ]
        );

        User::query()->updateOrCreate(
            ['kode' => 'MBG-SUPERADMIN-01'],
            [
                'name' => 'Super Admin MBG',
                'email' => 'superadmin@mbg.test',
                'role' => 'superadmin',
                'password' => Hash::make('password'),
                'sppg_id' => null,
                'sekolah_id' => null,
            ]
        );

        // Create one school with detailed realistic data
        $sekolahId = DB::table('sekolah')->insertGetId([
            'nama_sekolah' => 'SD Negeri Bandung Wetan 01',
            'kecamatan_id' => $kecamatan?->id,
            'alamat' => 'Jl. Tamblong No. 12, Bandung Wetan, Kota Bandung',
            'desa_kelurahan' => 'Bandung Wetan',
            'jenis_sekolah' => 'SD',
            'total_siswa' => 318,
            'nama_kepala_sekolah' => 'Drs. H. Dedi Supriadi, M.Pd.',
            'no_telepon_kepala_sekolah' => '022-420-1101',
            'email' => 'sd.bandungwetan01@mbg.test',
            'no_telepon' => '022-420-1101',
            'latitude' => -6.900681,
            'longitude' => 107.618840,
            'status_program_id' => $statusAktifId,
            'tanggal_bergabung' => '2026-04-08',
            'catatan' => 'Sekolah mitra utama untuk operasi harian MBG.',
        ]);

        // Create one SPPG and link to the school via laporan later
        $sppgId = DB::table('sppg')->insertGetId([
            'nama_sppg' => 'SPPG Tamblong Sentra',
            'kode_sppg' => 'SPPG-BDG-01',
            'kecamatan_id' => $kecamatan?->id,
            'alamat' => 'Jl. Tamblong No. 8, Bandung Wetan, Kota Bandung',
            'desa_kelurahan' => 'Bandung Wetan',
            'nama_pengelola' => 'Ibu Rini Lestari',
            'no_telepon_pengelola' => '0812-3456-7801',
            'email_pengelola' => 'sppg.bandungwetan@mbg.test',
            'kapasitas_harian' => 1250,
            'fasilitas_dapur' => 'Dapur Masak, Gudang Kering, Cold Storage, Ruang Cuci, Ruang Packing',
            'status_operasional' => 'Aktif',
            'latitude' => -6.899942,
            'longitude' => 107.617972,
            'mulai_operasional' => '2026-02-15',
            'jumlah_staf' => 16,
            'catatan' => 'SPPG utama dengan alur distribusi yang terpantau dan konsisten.',
            'bahanbaku_id' => $bahanBakuId,
            'ahli_gizi_id' => null,
            'jenis_dapur_id' => $jenisDapurId,
            'sertifikat' => 'SLHS-BDGWETAN-2026-01',
        ]);

        // Create a demo user for the SPPG and a demo sekolah operator
        User::query()->updateOrCreate(
            ['kode' => 'MBG-SPPG-01'],
            [
                'name' => 'Operator Dapur Tamblong',
                'email' => 'operator.sppg@mbg.test',
                'role' => 'sppg',
                'password' => Hash::make('password'),
                'sppg_id' => $sppgId,
                'sekolah_id' => null,
            ]
        );

        User::query()->updateOrCreate(
            ['kode' => 'MBG-SEK-01'],
            [
                'name' => 'Operator Sekolah SDN 01',
                'email' => 'operator.sekolah@mbg.test',
                'role' => 'sekolah',
                'password' => Hash::make('password'),
                'sekolah_id' => $sekolahId,
                'sppg_id' => null,
            ]
        );

        $giziUser = User::query()->updateOrCreate(
            ['kode' => 'MBG-GIZI-01'],
            [
                'name' => 'Ahli Gizi SPPG Tamblong',
                'email' => 'gizi@mbg.test',
                'role' => 'ahli_gizi',
                'password' => Hash::make('password'),
                'sppg_id' => $sppgId,
                'sekolah_id' => null,
            ]
        );

        // Insert a laporan_sppg linking SPPG -> Sekolah with menu and files for daily operations.
        $today = now()->toDateString();

        $laporanSppgId = DB::table('laporan_sppg')->insertGetId([
            'sppg_id' => $sppgId,
            'sekolah_id' => $sekolahId,
            'bahan_baku_id' => $bahanBakuId,
            'tanggal' => $today,
            'porsi_distribusi' => 318,
            'kalori' => 642,
            'protein' => 23,
            'karbo' => 81,
            'lemak' => 19,
            'status_delivery' => 'Terkirim',
            'status_terkirim' => 'Sukses',
            'menu_id' => null,
            'foto_menu' => 'reports/sppg/menu/daily-' . $today . '.jpg',
            'distributed_by' => $giziUser->id,
            'keterangan' => 'Distribusi pagi untuk satu sekolah dan satu SPPG yang terhubung.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $menuId = DB::table('menu')->insertGetId([
            'distribusi_id' => $laporanSppgId,
            'code' => 'MNU-BDG-01',
            'deskripsi' => 'Nasi putih, ayam panggang bumbu kecap, tumis buncis wortel, tempe crispy, buah semangka, dan susu UHT',
            'kategori' => 'Menu Hari Ini',
            'kalori' => 642,
            'protein' => 23,
            'karbohidrat' => 81,
            'lemak' => 19,
            'jumlah' => 318,
        ]);

        DB::table('laporan_sppg')
            ->where('id', $laporanSppgId)
            ->update(['menu_id' => $menuId]);

        // school report
        $laporanSekolahId = DB::table('laporan_sekolah')->insertGetId([
            'sekolah_id' => $sekolahId,
            'tanggal' => $today,
            'jumlah_penerima' => 318,
            'jumlah_dikonsumsi' => 315,
            'sisa' => 3,
            'keterangan' => 'Tiga siswa izin sakit, seluruh porsi tercatat dan terdokumentasi.',
            'created_at' => now(),
        ]);

        DB::table('laporan_lokasi')->insert([
            'laporan_sekolah_id' => $laporanSekolahId,
            'latitude' => -6.900681,
            'longitude' => 107.618840,
            'akurasi' => 8.7,
            'alamat' => 'Jl. Tamblong No. 12, Bandung Wetan, Kota Bandung',
        ]);

        DB::table('file_path')->insert([
            'laporan_sekolah_id' => $laporanSekolahId,
            'jenis' => 'menu',
            'file' => 'reports/school/menu/' . $sekolahId . '-' . $today . '.jpg',
        ]);

        DB::table('file_path')->insert([
            'laporan_sekolah_id' => $laporanSekolahId,
            'jenis' => 'siswa_makan',
            'file' => 'reports/school/student/' . $sekolahId . '-' . $today . '.jpg',
        ]);

        DB::table('file_path')->insert([
            'laporan_sekolah_id' => $laporanSekolahId,
            'jenis' => 'porsi_rusak',
            'file' => 'reports/school/damaged/' . $sekolahId . '-' . $today . '.jpg',
        ]);

        // Helpful note in DB for admins
        DB::table('pengaduan')->updateOrInsert(
            ['nama' => 'Catatan Seeder MBG'],
            [
                'nama' => 'Catatan Seeder MBG',
                'jenis_pelapor' => 'sekolah',
                'pesan' => 'Data operasional hanya menyisakan satu sekolah dan satu SPPG yang saling terhubung.',
                'tanggal_kirim' => $today,
                'status' => 'terbaca',
                'no_telepon' => '',
                'tujuan' => 'admin',
                'sekolah' => 'SD Negeri Bandung Wetan 01',
            ]
        );
    }
}
