<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MbgDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedLookupTables();
        $this->seedRoles();
        $this->seedReferenceData();
        $this->seedOperationalData();
        $this->seedUsers();
    }

    private function seedLookupTables(): void
    {
        foreach (['Aktif', 'Nonaktif'] as $status) {
            DB::table('status_program')->updateOrInsert(
                ['nama' => $status],
                ['nama' => $status]
            );
        }

        foreach (['kg', 'porsi', 'paket'] as $unit) {
            DB::table('satuan')->updateOrInsert(
                ['nama' => $unit],
                ['nama' => $unit]
            );
        }

        foreach (['Dapur Satelit Modular', 'Dapur Pusat', 'Dapur Komunitas'] as $jenisDapur) {
            DB::table('jenis_dapur')->updateOrInsert(
                ['nama' => $jenisDapur],
                ['nama' => $jenisDapur]
            );
        }

        foreach (['Ruang Cuci', 'Gudang Kering', 'Cold Storage', 'Dapur Masak'] as $fasilitas) {
            DB::table('fasilitas_dapur')->updateOrInsert(
                ['nama' => $fasilitas],
                ['nama' => $fasilitas]
            );
        }

        foreach (['Bandung Wetan', 'Sukasari', 'Cibiru', 'Coblong', 'Sumur Bandung'] as $namaKecamatan) {
            DB::table('kecamatan')->updateOrInsert(
                ['nama_kecamatan' => $namaKecamatan],
                [
                    'nama_kecamatan' => $namaKecamatan,
                    'kode_kecamatan' => strtoupper(str_replace(' ', '', $namaKecamatan)).'-001',
                ]
            );
        }
    }

    private function seedUsers(): void
    {
        $sekolahByCode = [
            'SEK-001' => DB::table('sekolah')->where('nama_sekolah', 'SD Negeri Cibiru 03')->value('id'),
            'SEK-002' => DB::table('sekolah')->where('nama_sekolah', 'SMP Negeri Bandung Wetan 1')->value('id'),
        ];

        $sppgByCode = [
            'SPPG-001' => DB::table('sppg')->where('kode_sppg', 'SPPG-001')->value('id'),
            'SPPG-002' => DB::table('sppg')->where('kode_sppg', 'SPPG-002')->value('id'),
            'GIZI-001' => DB::table('sppg')->where('kode_sppg', 'SPPG-003')->value('id'),
        ];

        $users = [
            ['kode' => 'ADMIN-001', 'name' => 'Admin MBG', 'email' => 'admin@mbg.test', 'role' => 'admin'],
            ['kode' => 'GIZI-001', 'name' => 'Ahli Gizi Demo', 'email' => 'gizi@mbg.test', 'role' => 'ahli_gizi'],
            ['kode' => 'SPPG-001', 'name' => 'Operator SPPG', 'email' => 'sppg@mbg.test', 'role' => 'sppg'],
            ['kode' => 'SEK-001', 'name' => 'Operator Sekolah', 'email' => 'sekolah@mbg.test', 'role' => 'sekolah'],
            ['kode' => 'SPPG-002', 'name' => 'Operator SPPG Timur', 'email' => 'sppg2@mbg.test', 'role' => 'sppg'],
            ['kode' => 'SEK-002', 'name' => 'Operator Sekolah Timur', 'email' => 'sekolah2@mbg.test', 'role' => 'sekolah'],
            ['kode' => 'SUPERADMIN-001', 'name' => 'Superadmin MBG', 'email' => 'superadmin@mbg.test', 'role' => 'superadmin'],
        ];

        foreach ($users as $user) {
            $sekolahId = $user['role'] === 'sekolah'
                ? ($sekolahByCode[$user['kode']] ?? null)
                : null;

            $sppgId = in_array($user['role'], ['sppg', 'ahli_gizi'], true)
                ? ($sppgByCode[$user['kode']] ?? null)
                : null;

            User::query()->updateOrCreate(
                ['kode' => $user['kode']],
                [
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'password' => Hash::make('password'),
                    'sekolah_id' => $sekolahId,
                    'sppg_id' => $sppgId,
                ]
            );
        }

        $giziUserId = User::query()->where('kode', 'GIZI-001')->value('id');
        if ($giziUserId) {
            DB::table('sppg')->where('kode_sppg', 'SPPG-003')->update(['ahli_gizi_id' => $giziUserId]);
        }
    }

    private function seedRoles(): void
    {
        $roles = [
            ['code' => 'superadmin', 'label' => 'Superadmin', 'description' => 'Akses penuh ke seluruh modul dan master data.', 'sort_order' => 1],
            ['code' => 'admin', 'label' => 'Admin', 'description' => 'Akses pengelolaan data umum dan akun.', 'sort_order' => 2],
            ['code' => 'ahli_gizi', 'label' => 'Ahli Gizi', 'description' => 'Akun ahli gizi untuk supervisi menu dan distribusi.', 'sort_order' => 3],
            ['code' => 'sppg', 'label' => 'SPPG', 'description' => 'Akun operasional dapur SPPG.', 'sort_order' => 4],
            ['code' => 'sekolah', 'label' => 'Sekolah', 'description' => 'Akun operasional sekolah.', 'sort_order' => 5],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['code' => $role['code']],
                $role
            );
        }
    }

    private function seedReferenceData(): void
    {
        $supplierId = DB::table('supplier')->updateOrInsert(
            ['nama' => 'Supplier Pangan Sehat'],
            [
                'nama' => 'Supplier Pangan Sehat',
                'kategori' => 'Bahan Pokok',
                'alamat' => 'Jl. Soekarno Hatta No. 88, Bandung',
                'deskripsi' => 'Pemasok bahan pangan untuk dapur MBG.',
                'contact_person' => 'Budi Santoso',
                'latitude' => -6.9222,
                'longitude' => 107.6070,
            ]
        );

        $supplier = DB::table('supplier')->where('nama', 'Supplier Pangan Sehat')->first();
        $supplierId = $supplier?->id;

        $satuanId = DB::table('satuan')->where('nama', 'kg')->value('id');

        DB::table('bahanbaku')->updateOrInsert(
            ['nama' => 'Beras Premium'],
            [
                'nama' => 'Beras Premium',
                'ketersediaan' => 'Stok Aman',
                'kategori' => 'Karbohidrat',
                'harga_satuan' => 15000,
                'supplier_id' => $supplierId,
                'satuan_id' => $satuanId,
                'deskripsi' => 'Beras harian untuk distribusi MBG.',
            ]
        );

        DB::table('user_profiles')->updateOrInsert(
            ['role' => 'superadmin'],
            ['role' => 'superadmin']
        );
        DB::table('user_profiles')->updateOrInsert(
            ['role' => 'admin'],
            ['role' => 'admin']
        );
        DB::table('user_profiles')->updateOrInsert(
            ['role' => 'ahli_gizi'],
            ['role' => 'ahli_gizi']
        );
        DB::table('user_profiles')->updateOrInsert(
            ['role' => 'sppg'],
            ['role' => 'sppg']
        );
        DB::table('user_profiles')->updateOrInsert(
            ['role' => 'sekolah'],
            ['role' => 'sekolah']
        );
    }

    private function seedOperationalData(): void
    {
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        $aktifId = DB::table('status_program')->where('nama', 'Aktif')->value('id');
        $sukasariId = DB::table('kecamatan')->where('nama_kecamatan', 'Sukasari')->value('id');
        $bandungWetanId = DB::table('kecamatan')->where('nama_kecamatan', 'Bandung Wetan')->value('id');
        $cibiruId = DB::table('kecamatan')->where('nama_kecamatan', 'Cibiru')->value('id');
        $coblongId = DB::table('kecamatan')->where('nama_kecamatan', 'Coblong')->value('id');
        $sumurBandungId = DB::table('kecamatan')->where('nama_kecamatan', 'Sumur Bandung')->value('id');
        $bahanBakuId = DB::table('bahanbaku')->where('nama', 'Beras Premium')->value('id');
        $jenisDapurId = DB::table('jenis_dapur')->where('nama', 'Dapur Satelit Modular')->value('id');
        $giziUserId = User::query()->where('kode', 'GIZI-001')->value('id');

        DB::table('kelompok')->updateOrInsert(
            ['kode' => 'KLP-001'],
            [
                'nama' => 'Kelompok Ibu Asuh Sukasari',
                'kode' => 'KLP-001',
                'tipe' => 'Ibu & Balita',
                'nib_hukum' => 'NIB-2026-0001',
                'deskripsi' => 'Kelompok penerima manfaat di wilayah Sukasari.',
                'kecamatan_id' => $sukasariId,
                'alamat' => 'Jl. Melati No. 10, Sukasari',
                'desa' => 'Sukasari',
                'nama_ketua' => 'Ibu Rina',
                'no_telepon_ketua' => '081200000001',
                'email_ketua' => 'rina@mbg.test',
                'jumlah_anggota' => 42,
                'visi_misi' => 'Mendukung gizi ibu dan balita.',
                'status_program_id' => $aktifId,
                'tanggal_bergabung' => '2026-04-01',
                'catatan' => 'Data demo.',
            ]
        );

        DB::table('kelompok')->updateOrInsert(
            ['kode' => 'KLP-002'],
            [
                'nama' => 'Kelompok Remaja Coblong',
                'kode' => 'KLP-002',
                'tipe' => 'Remaja',
                'nib_hukum' => 'NIB-2026-0002',
                'deskripsi' => 'Kelompok penerima manfaat di wilayah Coblong.',
                'kecamatan_id' => $coblongId,
                'alamat' => 'Jl. Dago No. 15, Coblong',
                'desa' => 'Coblong',
                'nama_ketua' => 'Pak Arif',
                'no_telepon_ketua' => '081200000002',
                'email_ketua' => 'arif@mbg.test',
                'jumlah_anggota' => 58,
                'visi_misi' => 'Mendukung gizi remaja dan keluarga.',
                'status_program_id' => $aktifId,
                'tanggal_bergabung' => '2026-04-10',
                'catatan' => 'Data demo tambahan.',
            ]
        );

        DB::table('sekolah')->updateOrInsert(
            ['nama_sekolah' => 'SD Negeri Cibiru 03'],
            [
                'nama_sekolah' => 'SD Negeri Cibiru 03',
                'kecamatan_id' => $cibiruId,
                'alamat' => 'Jl. Pendidikan No. 3, Cibiru',
                'desa_kelurahan' => 'Cibiru',
                'jenis_sekolah' => 'SD',
                'total_siswa' => 245,
                'nama_kepala_sekolah' => 'Ibu Dewi',
                'no_telepon_kepala_sekolah' => '0227000003',
                'email' => 'sdcibiru03@mbg.test',
                'no_telepon' => '0227000003',
                'latitude' => -6.9231,
                'longitude' => 107.6954,
                'status_program_id' => $aktifId,
                'tanggal_bergabung' => '2026-04-05',
                'catatan' => 'Sekolah contoh.',
            ]
        );

        DB::table('sekolah')->updateOrInsert(
            ['nama_sekolah' => 'SMP Negeri Bandung Wetan 1'],
            [
                'nama_sekolah' => 'SMP Negeri Bandung Wetan 1',
                'kecamatan_id' => $bandungWetanId,
                'alamat' => 'Jl. Diponegoro No. 1, Bandung Wetan',
                'desa_kelurahan' => 'Bandung Wetan',
                'jenis_sekolah' => 'SMP',
                'total_siswa' => 312,
                'nama_kepala_sekolah' => 'Pak Andi',
                'no_telepon_kepala_sekolah' => '0227000001',
                'email' => 'smpbw1@mbg.test',
                'no_telepon' => '0227000001',
                'latitude' => -6.9001,
                'longitude' => 107.6123,
                'status_program_id' => $aktifId,
                'tanggal_bergabung' => '2026-04-06',
                'catatan' => 'Sekolah contoh.',
            ]
        );

        DB::table('sekolah')->updateOrInsert(
            ['nama_sekolah' => 'SMP Negeri Coblong 2'],
            [
                'nama_sekolah' => 'SMP Negeri Coblong 2',
                'kecamatan_id' => $coblongId,
                'alamat' => 'Jl. Dago Atas No. 20, Coblong',
                'desa_kelurahan' => 'Coblong',
                'jenis_sekolah' => 'SMP',
                'total_siswa' => 280,
                'nama_kepala_sekolah' => 'Ibu Nisa',
                'no_telepon_kepala_sekolah' => '0227000004',
                'email' => 'smpcoblong2@mbg.test',
                'no_telepon' => '0227000004',
                'latitude' => -6.8862,
                'longitude' => 107.6142,
                'status_program_id' => $aktifId,
                'tanggal_bergabung' => '2026-04-07',
                'catatan' => 'Sekolah contoh tambahan.',
            ]
        );

        DB::table('sekolah')->updateOrInsert(
            ['nama_sekolah' => 'SD Negeri Sumur Bandung 01'],
            [
                'nama_sekolah' => 'SD Negeri Sumur Bandung 01',
                'kecamatan_id' => $sumurBandungId,
                'alamat' => 'Jl. Asia Afrika No. 5, Sumur Bandung',
                'desa_kelurahan' => 'Sumur Bandung',
                'jenis_sekolah' => 'SD',
                'total_siswa' => 198,
                'nama_kepala_sekolah' => 'Pak Hendra',
                'no_telepon_kepala_sekolah' => '0227000005',
                'email' => 'sdsumurbandung01@mbg.test',
                'no_telepon' => '0227000005',
                'latitude' => -6.9218,
                'longitude' => 107.6096,
                'status_program_id' => $aktifId,
                'tanggal_bergabung' => '2026-04-08',
                'catatan' => 'Sekolah contoh tambahan.',
            ]
        );

        $sekolahCibiruId = DB::table('sekolah')->where('nama_sekolah', 'SD Negeri Cibiru 03')->value('id');
        $sekolahBandungWetanId = DB::table('sekolah')->where('nama_sekolah', 'SMP Negeri Bandung Wetan 1')->value('id');
        $sekolahCoblongId = DB::table('sekolah')->where('nama_sekolah', 'SMP Negeri Coblong 2')->value('id');
        $sekolahSumurBandungId = DB::table('sekolah')->where('nama_sekolah', 'SD Negeri Sumur Bandung 01')->value('id');

        DB::table('sppg')->updateOrInsert(
            ['kode_sppg' => 'SPPG-001'],
            [
                'nama_sppg' => 'SPPG Sukasari Utama',
                'kode_sppg' => 'SPPG-001',
                'kecamatan_id' => $sukasariId,
                'alamat' => 'Jl. Melati No. 1, Sukasari',
                'desa_kelurahan' => 'Sukasari',
                'nama_pengelola' => 'Bapak Rudi',
                'no_telepon_pengelola' => '081200000010',
                'email_pengelola' => 'sppg1@mbg.test',
                'kapasitas_harian' => 1000,
                'fasilitas_dapur' => 'Dapur Masak, Gudang Kering, Cold Storage',
                'status_operasional' => 'Aktif',
                'latitude' => -6.9142,
                'longitude' => 107.6892,
                'mulai_operasional' => '2026-04-01',
                'jumlah_staf' => 12,
                'catatan' => 'SPPG demo utama.',
                'bahanbaku_id' => $bahanBakuId,
                'ahli_gizi_id' => $giziUserId,
                'jenis_dapur_id' => $jenisDapurId,
                'sertifikat' => 'SLHS-2026-001',
            ]
        );

        DB::table('sppg')->updateOrInsert(
            ['kode_sppg' => 'SPPG-003'],
            [
                'nama_sppg' => 'SPPG Coblong Sejahtera',
                'kode_sppg' => 'SPPG-003',
                'kecamatan_id' => $coblongId,
                'alamat' => 'Jl. Dago Atas No. 18, Coblong',
                'desa_kelurahan' => 'Coblong',
                'nama_pengelola' => 'Ibu Tia',
                'no_telepon_pengelola' => '081200000012',
                'email_pengelola' => 'sppg3@mbg.test',
                'kapasitas_harian' => 600,
                'fasilitas_dapur' => 'Dapur Masak, Gudang Kering',
                'status_operasional' => 'Aktif',
                'latitude' => -6.8871,
                'longitude' => 107.6131,
                'mulai_operasional' => '2026-04-09',
                'jumlah_staf' => 8,
                'catatan' => 'SPPG demo ketiga.',
                'bahanbaku_id' => $bahanBakuId,
                'ahli_gizi_id' => $giziUserId,
                'jenis_dapur_id' => $jenisDapurId,
                'sertifikat' => 'SLHS-2026-003',
            ]
        );

        DB::table('sppg')->updateOrInsert(
            ['kode_sppg' => 'SPPG-002'],
            [
                'nama_sppg' => 'SPPG Bandung Wetan Sentra',
                'kode_sppg' => 'SPPG-002',
                'kecamatan_id' => $bandungWetanId,
                'alamat' => 'Jl. Merdeka No. 2, Bandung Wetan',
                'desa_kelurahan' => 'Bandung Wetan',
                'nama_pengelola' => 'Ibu Sari',
                'no_telepon_pengelola' => '081200000011',
                'email_pengelola' => 'sppg2@mbg.test',
                'kapasitas_harian' => 750,
                'fasilitas_dapur' => 'Dapur Masak, Ruang Cuci',
                'status_operasional' => 'Aktif',
                'latitude' => -6.9021,
                'longitude' => 107.6201,
                'mulai_operasional' => '2026-04-03',
                'jumlah_staf' => 10,
                'catatan' => 'SPPG demo kedua.',
                'bahanbaku_id' => $bahanBakuId,
                'ahli_gizi_id' => $giziUserId,
                'jenis_dapur_id' => $jenisDapurId,
                'sertifikat' => 'SLHS-2026-002',
            ]
        );

        $sppgSukasariId = DB::table('sppg')->where('kode_sppg', 'SPPG-001')->value('id');
        $sppgBandungWetanId = DB::table('sppg')->where('kode_sppg', 'SPPG-002')->value('id');
        $sppgCoblongId = DB::table('sppg')->where('kode_sppg', 'SPPG-003')->value('id');

        $sekolahId = $sekolahCibiruId;
        $sekolahId2 = $sekolahCoblongId;
        $sekolahId3 = $sekolahSumurBandungId;
        $sppgId = $sppgSukasariId;
        $sppgId2 = $sppgBandungWetanId;
        $sppgId3 = $sppgCoblongId;

        DB::table('laporan_sekolah')->updateOrInsert(
            ['sekolah_id' => $sekolahId, 'tanggal' => $today],
            [
                'sekolah_id' => $sekolahId,
                'tanggal' => $today,
                'jumlah_penerima' => 245,
                'jumlah_dikonsumsi' => 240,
                'sisa' => 5,
                'keterangan' => 'Laporan hari ini.',
                'created_at' => now(),
            ]
        );

        DB::table('laporan_sekolah')->updateOrInsert(
            ['sekolah_id' => $sekolahId2, 'tanggal' => $today],
            [
                'sekolah_id' => $sekolahId2,
                'tanggal' => $today,
                'jumlah_penerima' => 280,
                'jumlah_dikonsumsi' => 276,
                'sisa' => 4,
                'keterangan' => 'Laporan hari ini.',
                'created_at' => now(),
            ]
        );

        DB::table('laporan_sekolah')->updateOrInsert(
            ['sekolah_id' => $sekolahId3, 'tanggal' => $today],
            [
                'sekolah_id' => $sekolahId3,
                'tanggal' => $today,
                'jumlah_penerima' => 198,
                'jumlah_dikonsumsi' => 195,
                'sisa' => 3,
                'keterangan' => 'Laporan hari ini.',
                'created_at' => now(),
            ]
        );

        DB::table('laporan_sekolah')->updateOrInsert(
            ['sekolah_id' => $sekolahId, 'tanggal' => $yesterday],
            [
                'sekolah_id' => $sekolahId,
                'tanggal' => $yesterday,
                'jumlah_penerima' => 245,
                'jumlah_dikonsumsi' => 243,
                'sisa' => 2,
                'keterangan' => 'Laporan demo sekolah.',
                'created_at' => now(),
            ]
        );

        DB::table('laporan_sekolah')->updateOrInsert(
            ['sekolah_id' => $sekolahId2, 'tanggal' => $yesterday],
            [
                'sekolah_id' => $sekolahId2,
                'tanggal' => $yesterday,
                'jumlah_penerima' => 280,
                'jumlah_dikonsumsi' => 275,
                'sisa' => 5,
                'keterangan' => 'Laporan demo sekolah.',
                'created_at' => now(),
            ]
        );

        DB::table('laporan_sppg')->updateOrInsert(
            ['sppg_id' => $sppgId, 'sekolah_id' => $sekolahId, 'tanggal' => $today],
            [
                'sppg_id' => $sppgId,
                'sekolah_id' => $sekolahId,
                'bahan_baku_id' => $bahanBakuId,
                'tanggal' => $today,
                'porsi_distribusi' => 245,
                'kalori' => 650,
                'protein' => 22,
                'karbo' => 80,
                'lemak' => 18,
                'status_delivery' => 'Terkirim',
                'status_terkirim' => 'Sukses',
                'distributed_by' => $giziUserId,
            ]
        );

        $laporanSppgId = DB::table('laporan_sppg')
            ->where('sppg_id', $sppgId)
            ->where('sekolah_id', $sekolahId)
            ->where('tanggal', $today)
            ->value('id');

        DB::table('laporan_sppg')->updateOrInsert(
            ['sppg_id' => $sppgId2, 'sekolah_id' => $sekolahId2, 'tanggal' => $today],
            [
                'sppg_id' => $sppgId2,
                'sekolah_id' => $sekolahId2,
                'bahan_baku_id' => $bahanBakuId,
                'tanggal' => $today,
                'porsi_distribusi' => 280,
                'kalori' => 640,
                'protein' => 20,
                'karbo' => 78,
                'lemak' => 17,
                'status_delivery' => 'Terkirim',
                'status_terkirim' => 'Sukses',
                'distributed_by' => $giziUserId,
            ]
        );

        DB::table('laporan_sppg')->updateOrInsert(
            ['sppg_id' => $sppgId3, 'sekolah_id' => $sekolahId3, 'tanggal' => $today],
            [
                'sppg_id' => $sppgId3,
                'sekolah_id' => $sekolahId3,
                'bahan_baku_id' => $bahanBakuId,
                'tanggal' => $today,
                'porsi_distribusi' => 198,
                'kalori' => 635,
                'protein' => 21,
                'karbo' => 79,
                'lemak' => 16,
                'status_delivery' => 'Terkirim',
                'status_terkirim' => 'Sukses',
                'distributed_by' => $giziUserId,
            ]
        );

        DB::table('menu')->updateOrInsert(
            ['distribusi_id' => $laporanSppgId, 'code' => 'MNU-001'],
            [
                'distribusi_id' => $laporanSppgId,
                'code' => 'MNU-001',
                'deskripsi' => 'Nasi, ayam kecap, sayur bening',
                'kategori' => 'Menu Utama',
                'kalori' => 650,
                'protein' => 22,
                'karbohidrat' => 80,
                'lemak' => 18,
                'jumlah' => 245,
            ]
        );

        DB::table('menu')->updateOrInsert(
            ['distribusi_id' => $laporanSppgId, 'code' => 'MNU-002'],
            [
                'distribusi_id' => $laporanSppgId,
                'code' => 'MNU-002',
                'deskripsi' => 'Nasi, telur dadar, tumis bayam',
                'kategori' => 'Menu Tambahan',
                'kalori' => 620,
                'protein' => 20,
                'karbohidrat' => 78,
                'lemak' => 17,
                'jumlah' => 245,
            ]
        );

        $laporanSppgId2 = DB::table('laporan_sppg')
            ->where('sppg_id', $sppgId2)
            ->where('sekolah_id', $sekolahId2)
            ->where('tanggal', $today)
            ->value('id');

        DB::table('menu')->updateOrInsert(
            ['distribusi_id' => $laporanSppgId2, 'code' => 'MNU-003'],
            [
                'distribusi_id' => $laporanSppgId2,
                'code' => 'MNU-003',
                'deskripsi' => 'Nasi, tempe orek, sayur lodeh',
                'kategori' => 'Menu Utama',
                'kalori' => 640,
                'protein' => 20,
                'karbohidrat' => 78,
                'lemak' => 17,
                'jumlah' => 280,
            ]
        );

        $laporanSppgId3 = DB::table('laporan_sppg')
            ->where('sppg_id', $sppgId3)
            ->where('sekolah_id', $sekolahId3)
            ->where('tanggal', $today)
            ->value('id');

        DB::table('menu')->updateOrInsert(
            ['distribusi_id' => $laporanSppgId3, 'code' => 'MNU-004'],
            [
                'distribusi_id' => $laporanSppgId3,
                'code' => 'MNU-004',
                'deskripsi' => 'Nasi, ayam suwir, tumis wortel',
                'kategori' => 'Menu Utama',
                'kalori' => 635,
                'protein' => 21,
                'karbohidrat' => 79,
                'lemak' => 16,
                'jumlah' => 198,
            ]
        );

        DB::table('laporan_lokasi')->updateOrInsert(
            ['laporan_sekolah_id' => DB::table('laporan_sekolah')->where('sekolah_id', $sekolahId)->where('tanggal', $today)->value('id')],
            [
                'laporan_sekolah_id' => DB::table('laporan_sekolah')->where('sekolah_id', $sekolahId)->where('tanggal', $today)->value('id'),
                'latitude' => -6.9231,
                'longitude' => 107.6954,
                'akurasi' => 12.5,
                'alamat' => 'Jl. Pendidikan No. 3, Cibiru',
            ]
        );

        DB::table('laporan_lokasi')->updateOrInsert(
            ['laporan_sekolah_id' => DB::table('laporan_sekolah')->where('sekolah_id', $sekolahId2)->where('tanggal', $today)->value('id')],
            [
                'laporan_sekolah_id' => DB::table('laporan_sekolah')->where('sekolah_id', $sekolahId2)->where('tanggal', $today)->value('id'),
                'latitude' => -6.8862,
                'longitude' => 107.6142,
                'akurasi' => 10.2,
                'alamat' => 'Jl. Dago Atas No. 20, Coblong',
            ]
        );

        DB::table('laporan_lokasi')->updateOrInsert(
            ['laporan_sekolah_id' => DB::table('laporan_sekolah')->where('sekolah_id', $sekolahId3)->where('tanggal', $today)->value('id')],
            [
                'laporan_sekolah_id' => DB::table('laporan_sekolah')->where('sekolah_id', $sekolahId3)->where('tanggal', $today)->value('id'),
                'latitude' => -6.9218,
                'longitude' => 107.6096,
                'akurasi' => 11.8,
                'alamat' => 'Jl. Asia Afrika No. 5, Sumur Bandung',
            ]
        );

        DB::table('file_path')->updateOrInsert(
            ['laporan_sekolah_id' => DB::table('laporan_sekolah')->where('sekolah_id', $sekolahId)->where('tanggal', $today)->value('id'), 'file' => 'laporan-demo.pdf'],
            [
                'laporan_sekolah_id' => DB::table('laporan_sekolah')->where('sekolah_id', $sekolahId)->where('tanggal', $today)->value('id'),
                'jenis' => 'pdf',
                'file' => 'laporan-demo.pdf',
                'created_at' => now(),
            ]
        );

        $schoolReportSeries = [
            ['sekolah_id' => $sekolahId, 'base_penerima' => 245, 'latitude' => -6.9231, 'longitude' => 107.6954, 'alamat' => 'Jl. Pendidikan No. 3, Cibiru'],
            ['sekolah_id' => $sekolahId2, 'base_penerima' => 280, 'latitude' => -6.8862, 'longitude' => 107.6142, 'alamat' => 'Jl. Dago Atas No. 20, Coblong'],
            ['sekolah_id' => $sekolahId3, 'base_penerima' => 198, 'latitude' => -6.9218, 'longitude' => 107.6096, 'alamat' => 'Jl. Asia Afrika No. 5, Sumur Bandung'],
        ];

        $sppgReportSeries = [
            ['sppg_id' => $sppgId, 'sekolah_id' => $sekolahId, 'base_porsi' => 245, 'menu' => 'Nasi, ayam kecap, sayur bening'],
            ['sppg_id' => $sppgId2, 'sekolah_id' => $sekolahId2, 'base_porsi' => 280, 'menu' => 'Nasi, tempe orek, sayur lodeh'],
            ['sppg_id' => $sppgId3, 'sekolah_id' => $sekolahId3, 'base_porsi' => 198, 'menu' => 'Nasi, ayam suwir, tumis wortel'],
        ];

        for ($offset = 0; $offset < 5; $offset++) {
            $date = now()->startOfDay()->addDays($offset)->toDateString();

            foreach ($schoolReportSeries as $index => $schoolReport) {
                $laporanPenerima = $this->randomizeAround($schoolReport['base_penerima'], 16);
                $dikonsumsi = max(0, $laporanPenerima - random_int(0, min(8, $laporanPenerima)));
                $sisa = max(0, $laporanPenerima - $dikonsumsi);

                DB::table('laporan_sekolah')->updateOrInsert(
                    ['sekolah_id' => $schoolReport['sekolah_id'], 'tanggal' => $date],
                    [
                        'sekolah_id' => $schoolReport['sekolah_id'],
                        'tanggal' => $date,
                        'jumlah_penerima' => $laporanPenerima,
                        'jumlah_dikonsumsi' => $dikonsumsi,
                        'sisa' => $sisa,
                        'keterangan' => $offset === 0 ? 'Laporan hari ini.' : 'Laporan demo otomatis.',
                        'created_at' => now(),
                    ]
                );

                $laporanId = DB::table('laporan_sekolah')
                    ->where('sekolah_id', $schoolReport['sekolah_id'])
                    ->where('tanggal', $date)
                    ->value('id');

                if ($laporanId) {
                    DB::table('laporan_lokasi')->updateOrInsert(
                        ['laporan_sekolah_id' => $laporanId],
                        [
                            'laporan_sekolah_id' => $laporanId,
                            'latitude' => $schoolReport['latitude'],
                            'longitude' => $schoolReport['longitude'],
                            'akurasi' => random_int(80, 180) / 10,
                            'alamat' => $schoolReport['alamat'],
                        ]
                    );

                    DB::table('file_path')->updateOrInsert(
                        ['laporan_sekolah_id' => $laporanId, 'jenis' => 'menu'],
                        [
                            'laporan_sekolah_id' => $laporanId,
                            'jenis' => 'menu',
                            'file' => 'reports/school/menu/' . $schoolReport['sekolah_id'] . '-' . $date . '.jpg',
                            'created_at' => now(),
                        ]
                    );

                    DB::table('file_path')->updateOrInsert(
                        ['laporan_sekolah_id' => $laporanId, 'jenis' => 'siswa_makan'],
                        [
                            'laporan_sekolah_id' => $laporanId,
                            'jenis' => 'siswa_makan',
                            'file' => 'reports/school/student/' . $schoolReport['sekolah_id'] . '-' . $date . '.jpg',
                            'created_at' => now(),
                        ]
                    );
                }
            }

            foreach ($sppgReportSeries as $index => $sppgReport) {
                $porsi = $this->randomizeAround($sppgReport['base_porsi'], 20);

                DB::table('laporan_sppg')->updateOrInsert(
                    ['sppg_id' => $sppgReport['sppg_id'], 'sekolah_id' => $sppgReport['sekolah_id'], 'tanggal' => $date],
                    [
                        'sppg_id' => $sppgReport['sppg_id'],
                        'sekolah_id' => $sppgReport['sekolah_id'],
                        'bahan_baku_id' => $bahanBakuId,
                        'tanggal' => $date,
                        'porsi_distribusi' => $porsi,
                        'kalori' => random_int(620, 665),
                        'protein' => random_int(18, 24),
                        'karbo' => random_int(76, 84),
                        'lemak' => random_int(15, 20),
                        'status_delivery' => 'Terkirim',
                        'status_terkirim' => 'Sukses',
                        'distributed_by' => $giziUserId,
                    ]
                );

                $laporanSppgId = DB::table('laporan_sppg')
                    ->where('sppg_id', $sppgReport['sppg_id'])
                    ->where('sekolah_id', $sppgReport['sekolah_id'])
                    ->where('tanggal', $date)
                    ->value('id');

                if ($laporanSppgId) {
                    DB::table('menu')->updateOrInsert(
                        ['distribusi_id' => $laporanSppgId, 'code' => 'MNU-' . ($offset + 1) . '-' . ($index + 1)],
                        [
                            'distribusi_id' => $laporanSppgId,
                            'code' => 'MNU-' . ($offset + 1) . '-' . ($index + 1),
                            'deskripsi' => $sppgReport['menu'],
                            'kategori' => $offset === 0 ? 'Menu Harian' : 'Menu Demo',
                            'kalori' => random_int(620, 665),
                            'protein' => random_int(18, 24),
                            'karbohidrat' => random_int(76, 84),
                            'lemak' => random_int(15, 20),
                            'jumlah' => $porsi,
                        ]
                    );
                }
            }
        }

        DB::table('pengaduan')->updateOrInsert(
            ['nama' => 'Demo Pengadu'],
            [
                'nama' => 'Demo Pengadu',
                'jenis_pelapor' => 'individu',
                'pesan' => 'Ini contoh pengaduan untuk data awal sistem.',
                'tanggal_kirim' => $today,
                'status' => 'baru',
                'no_telepon' => '081200000099',
                'tujuan' => 'sekolah',
                'sekolah' => 'SD Negeri Cibiru 03',
            ]
        );
    }

    private function randomizeAround(int $baseValue, int $spread): int
    {
        return max(0, random_int(max(0, $baseValue - $spread), $baseValue + $spread));
    }
}