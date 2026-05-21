<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SppgController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $kecamatan = trim((string) $request->query('kecamatan', ''));
        $perPage = max(1, min(50, (int) $request->query('per_page', 6)));

        $query = DB::table('sppg as s')
            ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
            ->leftJoin('laporan_sppg as ls', 'ls.sppg_id', '=', 's.id')
            ->selectRaw('s.id, s.nama_sppg, s.alamat, s.status_operasional, k.nama_kecamatan, COUNT(DISTINCT ls.sekolah_id) as penerima')
            ->groupBy('s.id', 's.nama_sppg', 's.alamat', 's.status_operasional', 'k.nama_kecamatan');

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                $builder->where('s.nama_sppg', 'like', "%{$search}%")
                    ->orWhere('k.nama_kecamatan', 'like', "%{$search}%");
            });
        }

        if ($kecamatan !== '' && strtolower($kecamatan) !== 'semua') {
            $query->where('k.nama_kecamatan', $kecamatan);
        }

        $pagination = $query->orderBy('s.nama_sppg')->paginate($perPage);

        $data = collect($pagination->items())->map(function ($row) {
            return [
                'id' => $row->id,
                'name' => $row->nama_sppg,
                'kecamatan' => $row->nama_kecamatan ?? '-',
                'penerima' => (int) ($row->penerima ?? 0),
                'status' => $row->status_operasional ?? 'Aktif',
                'lokasi' => $row->alamat ?? '-',
            ];
        })->values();

        $kecamatanOptions = DB::table('kecamatan')
            ->orderBy('nama_kecamatan')
            ->pluck('nama_kecamatan')
            ->filter()
            ->values();

        return response()->json([
            'data' => $data,
            'meta' => [
                'currentPage' => $pagination->currentPage(),
                'lastPage' => $pagination->lastPage(),
                'perPage' => $pagination->perPage(),
                'total' => $pagination->total(),
                'kecamatanOptions' => $kecamatanOptions,
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $sppg = DB::table('sppg as s')
            ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
            ->leftJoin('jenis_dapur as jd', 'jd.id', '=', 's.jenis_dapur_id')
            ->leftJoin('users as u', 'u.id', '=', 's.ahli_gizi_id')
            ->select([
                's.id',
                's.nama_sppg',
                's.alamat',
                's.status_operasional',
                's.kapasitas_harian',
                's.no_telepon_pengelola',
                's.email_pengelola',
                's.nama_pengelola',
                's.fasilitas_dapur',
                's.sertifikat',
                's.latitude',
                's.longitude',
                'k.nama_kecamatan',
                'jd.nama as jenis_dapur',
                'u.name as ahli_gizi_nama',
                'u.email as ahli_gizi_email',
            ])
            ->where('s.id', $id)
            ->first();

        if (! $sppg) {
            return response()->json(['message' => 'SPPG tidak ditemukan.'], 404);
        }

        $servedSchools = DB::table('laporan_sppg as ls')
            ->join('sekolah as sc', 'sc.id', '=', 'ls.sekolah_id')
            ->where('ls.sppg_id', $id)
            ->groupBy('sc.id', 'sc.nama_sekolah', 'sc.alamat', 'sc.jenis_sekolah')
            ->orderBy('sc.nama_sekolah')
            ->get([
                'sc.id',
                'sc.nama_sekolah',
                'sc.alamat',
                'sc.jenis_sekolah',
            ])
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'name' => $row->nama_sekolah,
                    'status' => 'Aktif',
                    'address' => $row->alamat ?? '-',
                    'level' => $row->jenis_sekolah ?? '-',
                ];
            })
            ->values();

        $distribusi = DB::table('laporan_sppg as ls')
            ->join('sekolah as sc', 'sc.id', '=', 'ls.sekolah_id')
            ->leftJoin('menu as selected_menu', 'selected_menu.id', '=', 'ls.menu_id')
            ->leftJoin('menu as m', 'm.distribusi_id', '=', 'ls.id')
            ->where('ls.sppg_id', $id)
            ->orderByDesc('ls.tanggal')
            ->orderByDesc('ls.id')
            ->get([
                'ls.id',
                'ls.tanggal',
                'ls.created_at',
                'ls.menu_id',
                'ls.porsi_distribusi',
                'ls.kalori',
                'ls.protein',
                'ls.karbo',
                'ls.lemak',
                'ls.status_delivery',
                'ls.status_terkirim',
                'ls.foto_menu',
                'selected_menu.deskripsi as selected_menu_deskripsi',
                'selected_menu.kalori as selected_menu_kalori',
                'selected_menu.protein as selected_menu_protein',
                'selected_menu.karbohidrat as selected_menu_karbohidrat',
                'selected_menu.lemak as selected_menu_lemak',
                'm.kalori as legacy_menu_kalori',
                'm.protein as legacy_menu_protein',
                'm.karbohidrat as legacy_menu_karbohidrat',
                'm.lemak as legacy_menu_lemak',
                'sc.nama_sekolah',
                'sc.jenis_sekolah',
                'm.deskripsi as menu_deskripsi',
            ])
            ->groupBy('id')
            ->map(function ($rows) {
                $first = $rows->first();
                $legacyMenu = $rows->pluck('menu_deskripsi')->filter()->unique()->values()->implode(', ');
                $menu = $first->selected_menu_deskripsi ?? '';

                if ($menu === '') {
                    $menu = $legacyMenu;
                }

                $kalori = $first->kalori ?? $first->selected_menu_kalori;
                $protein = $first->protein ?? $first->selected_menu_protein;
                $karbo = $first->karbo ?? $first->selected_menu_karbohidrat;
                $lemak = $first->lemak ?? $first->selected_menu_lemak;

                if ($kalori === null) {
                    $kalori = $first->legacy_menu_kalori;
                }

                if ($protein === null) {
                    $protein = $first->legacy_menu_protein;
                }

                if ($karbo === null) {
                    $karbo = $first->legacy_menu_karbohidrat;
                }

                if ($lemak === null) {
                    $lemak = $first->legacy_menu_lemak;
                }

                return [
                    'id' => (int) $first->id,
                    'tanggal' => (string) $first->tanggal,
                    'createdAt' => $first->created_at ? date('Y-m-d H:i:s', strtotime((string) $first->created_at)) : null,
                    'sekolah' => $first->nama_sekolah ?? '-',
                    'level' => $first->jenis_sekolah ?? '-',
                    'menu' => $menu !== '' ? $menu : 'Menu belum diinput',
                    'porsi' => (int) ($first->porsi_distribusi ?? 0),
                    'kalori' => $kalori !== null ? (int) $kalori : null,
                    'protein' => $protein !== null ? (int) $protein : null,
                    'karbo' => $karbo !== null ? (int) $karbo : null,
                    'lemak' => $lemak !== null ? (int) $lemak : null,
                    'status' => $first->status_delivery ?? $first->status_terkirim ?? 'Aktif',
                    'fotoMenuUrl' => $first->foto_menu ? url('/storage/' . $first->foto_menu) : null,
                ];
            })
            ->values();

        $servedSchoolIds = $servedSchools->pluck('id')->all();

        $reports = empty($servedSchoolIds)
            ? collect()
            : DB::table('laporan_sekolah as ls')
                ->join('sekolah as sc', 'sc.id', '=', 'ls.sekolah_id')
                ->leftJoin('laporan_lokasi as ll', 'll.laporan_sekolah_id', '=', 'ls.id')
                ->leftJoin('file_path as fm', function ($join): void {
                    $join->on('fm.laporan_sekolah_id', '=', 'ls.id')
                        ->where('fm.jenis', '=', 'menu');
                })
                ->leftJoin('file_path as fs', function ($join): void {
                    $join->on('fs.laporan_sekolah_id', '=', 'ls.id')
                        ->where('fs.jenis', '=', 'siswa_makan');
                })
                ->whereIn('ls.sekolah_id', $servedSchoolIds)
                ->orderByDesc('ls.tanggal')
                ->orderByDesc('ls.created_at')
                ->get([
                    'ls.id',
                    'ls.tanggal',
                    'ls.created_at',
                    'ls.jumlah_penerima',
                    'ls.jumlah_dikonsumsi',
                    'ls.sisa',
                    'ls.keterangan',
                    'sc.nama_sekolah',
                    'sc.jenis_sekolah',
                    'll.latitude',
                    'll.longitude',
                    'll.akurasi',
                    'll.alamat as lokasi_alamat',
                    'fm.file as foto_menu',
                    'fs.file as foto_siswa',
                ])
                ->map(function ($row) {
                    $createdAt = $row->created_at ? date('Y-m-d H:i:s', strtotime((string) $row->created_at)) : (string) $row->tanggal;

                    return [
                        'id' => (int) $row->id,
                        'tanggal' => (string) $row->tanggal,
                        'createdAt' => $createdAt,
                        'schoolName' => $row->nama_sekolah ?? '-',
                        'schoolType' => $row->jenis_sekolah ?? '-',
                        'jumlahPenerima' => (int) ($row->jumlah_penerima ?? 0),
                        'jumlahDikonsumsi' => (int) ($row->jumlah_dikonsumsi ?? 0),
                        'sisa' => (int) ($row->sisa ?? 0),
                        'keterangan' => $row->keterangan,
                        'lokasi' => [
                            'latitude' => $row->latitude !== null ? (float) $row->latitude : null,
                            'longitude' => $row->longitude !== null ? (float) $row->longitude : null,
                            'akurasi' => $row->akurasi !== null ? (float) $row->akurasi : null,
                            'alamat' => $row->lokasi_alamat ?? '-',
                        ],
                        'fotoMenuUrl' => $row->foto_menu ? url('/storage/' . $row->foto_menu) : null,
                        'fotoSiswaUrl' => $row->foto_siswa ? url('/storage/' . $row->foto_siswa) : null,
                    ];
                })
                ->values();

        $facilityList = collect(explode(',', (string) ($sppg->fasilitas_dapur ?? '')))
            ->map(fn ($item) => trim($item))
            ->filter()
            ->values();

        return response()->json([
            'data' => [
                'id' => $sppg->id,
                'name' => $sppg->nama_sppg,
                'address' => $sppg->alamat ?? '-',
                'status' => $sppg->status_operasional ?? 'Aktif',
                'location' => [
                    'latitude' => $sppg->latitude !== null ? (float) $sppg->latitude : null,
                    'longitude' => $sppg->longitude !== null ? (float) $sppg->longitude : null,
                    'address' => $sppg->alamat ?? '-',
                    'district' => $sppg->nama_kecamatan ?? '-',
                    'mapUrl' => $sppg->latitude !== null && $sppg->longitude !== null
                        ? sprintf(
                            'https://www.openstreetmap.org/export/embed.html?bbox=%1$s,%2$s,%3$s,%4$s&layer=mapnik&marker=%5$s,%6$s',
                            (float) $sppg->longitude - 0.01,
                            (float) $sppg->latitude - 0.01,
                            (float) $sppg->longitude + 0.01,
                            (float) $sppg->latitude + 0.01,
                            (float) $sppg->latitude,
                            (float) $sppg->longitude,
                        )
                        : null,
                    'mapsLink' => $sppg->latitude !== null && $sppg->longitude !== null
                        ? sprintf('https://www.openstreetmap.org/?mlat=%1$s&mlon=%2$s#map=17/%1$s/%2$s', (float) $sppg->latitude, (float) $sppg->longitude)
                        : null,
                ],
                'stats' => [
                    [
                        'label' => 'Lokasi',
                        'value' => $sppg->nama_kecamatan ?? '-',
                        'sub' => $sppg->alamat ?? '-',
                    ],
                    [
                        'label' => 'Kapasitas',
                        'value' => (string) ((int) ($sppg->kapasitas_harian ?? 0)),
                        'sub' => 'porsi per hari',
                    ],
                    [
                        'label' => 'Operasional',
                        'value' => 'Senin - Jumat',
                        'sub' => 'jadwal standar',
                    ],
                    [
                        'label' => 'Sekolah',
                        'value' => (string) $servedSchools->count(),
                        'sub' => 'sekolah dilayani',
                    ],
                ],
                'contact' => [
                    'phone' => $sppg->no_telepon_pengelola ?? '-',
                    'email' => $sppg->email_pengelola ?? '-',
                    'name' => $sppg->nama_pengelola ?? '-',
                ],
                'facilities' => $facilityList->isNotEmpty() ? $facilityList : ['Data fasilitas belum diisi'],
                'photos' => [],
                'nutritionist' => [
                    'name' => $sppg->ahli_gizi_nama ?? 'Belum diisi',
                    'title' => 'Ahli Gizi',
                    'org' => $sppg->ahli_gizi_email ?? '-',
                ],
                'certificate' => [
                    'name' => 'Sertifikat SLHS',
                    'number' => $sppg->sertifikat ?? '-',
                    'issued' => '-',
                    'validUntil' => '-',
                ],
                'distribusi' => $distribusi,
                'reports' => $reports,
                'servedSchools' => $servedSchools,
            ],
        ]);
    }
}
