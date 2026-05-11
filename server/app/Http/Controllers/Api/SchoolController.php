<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SchoolController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $jenis = trim((string) $request->query('jenis', ''));

        $query = DB::table('sekolah as s')
            ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
            ->select([
                's.id',
                's.nama_sekolah',
                's.jenis_sekolah',
                's.alamat',
                's.total_siswa',
                's.no_telepon',
                'k.nama_kecamatan',
            ]);

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                $builder->where('s.nama_sekolah', 'like', "%{$search}%")
                    ->orWhere('k.nama_kecamatan', 'like', "%{$search}%");
            });
        }

        if ($jenis !== '' && strtolower($jenis) !== 'semua') {
            $query->where('s.jenis_sekolah', $jenis);
        }

        $schools = $query
            ->orderBy('s.nama_sekolah')
            ->get()
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'name' => $row->nama_sekolah,
                    'type' => $row->jenis_sekolah ?? '-',
                    'kecamatan' => $row->nama_kecamatan ?? '-',
                    'alamat' => $row->alamat ?? '-',
                    'siswa' => (int) ($row->total_siswa ?? 0),
                    'noTelp' => $row->no_telepon ?? '-',
                    'isActive' => true,
                ];
            });

        return response()->json(['data' => $schools]);
    }

    public function show(int $id): JsonResponse
    {
        $school = DB::table('sekolah as s')
            ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
            ->leftJoin('status_program as sp', 'sp.id', '=', 's.status_program_id')
            ->select([
                's.id',
                's.nama_sekolah',
                's.jenis_sekolah',
                's.alamat',
                's.total_siswa',
                's.tanggal_bergabung',
                's.latitude',
                's.longitude',
                'k.nama_kecamatan',
                'sp.nama as status_program',
            ])
            ->where('s.id', $id)
            ->first();

        if (! $school) {
            return response()->json(['message' => 'Sekolah tidak ditemukan.'], 404);
        }

        $primarySppg = DB::table('laporan_sppg as ls')
            ->join('sppg as s', 's.id', '=', 'ls.sppg_id')
            ->leftJoin('jenis_dapur as jd', 'jd.id', '=', 's.jenis_dapur_id')
            ->selectRaw('s.id, s.nama_sppg, jd.nama as jenis_dapur, MAX(s.kapasitas_harian) as kapasitas_harian')
            ->where('ls.sekolah_id', $id)
            ->groupBy('s.id', 's.nama_sppg', 'jd.nama')
            ->orderByDesc(DB::raw('COUNT(ls.id)'))
            ->first();

        if (! $primarySppg && $school->nama_kecamatan) {
            $primarySppg = DB::table('sppg as s')
                ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
                ->leftJoin('jenis_dapur as jd', 'jd.id', '=', 's.jenis_dapur_id')
                ->select('s.id', 's.nama_sppg', 'jd.nama as jenis_dapur', 's.kapasitas_harian')
                ->where('k.nama_kecamatan', $school->nama_kecamatan)
                ->orderBy('s.id')
                ->first();
        }

        $distribusi = DB::table('laporan_sppg as ls')
            ->leftJoin('menu as selected_menu', 'selected_menu.id', '=', 'ls.menu_id')
            ->leftJoin('menu as m', 'm.distribusi_id', '=', 'ls.id')
            ->select([
                'ls.id',
                'ls.tanggal',
                'ls.menu_id',
                'ls.porsi_distribusi',
                'selected_menu.deskripsi as selected_menu_deskripsi',
                'selected_menu.kalori as selected_menu_kalori',
                'selected_menu.protein as selected_menu_protein',
                'selected_menu.karbohidrat as selected_menu_karbohidrat',
                'selected_menu.lemak as selected_menu_lemak',
                'm.kalori as legacy_menu_kalori',
                'm.protein as legacy_menu_protein',
                'm.karbohidrat as legacy_menu_karbohidrat',
                'm.lemak as legacy_menu_lemak',
                'm.deskripsi as menu_deskripsi',
            ])
            ->where('ls.sekolah_id', $id)
            ->orderByDesc('ls.tanggal')
            ->orderByDesc('ls.id')
            ->get()
            ->groupBy('id')
            ->map(function ($rows, $distribusiId) {
                $first = $rows->first();
                $legacyMenu = $rows->pluck('menu_deskripsi')->filter()->unique()->values()->implode(', ');
                $menu = $first->selected_menu_deskripsi ?? '';

                if ($menu === '') {
                    $menu = $legacyMenu;
                }

                return [
                    'id' => (int) $distribusiId,
                    'tanggal' => (string) $first->tanggal,
                    'menu' => $menu !== '' ? $menu : 'Menu belum diinput',
                    'porsi' => (int) ($first->porsi_distribusi ?? 0),
                    'jam' => '-',
                ];
            })
            ->values();

        $reports = DB::table('laporan_sekolah as ls')
            ->leftJoin('laporan_lokasi as ll', 'll.laporan_sekolah_id', '=', 'ls.id')
            ->leftJoin('file_path as fm', function ($join): void {
                $join->on('fm.laporan_sekolah_id', '=', 'ls.id')
                    ->where('fm.jenis', '=', 'menu');
            })
            ->leftJoin('file_path as fs', function ($join): void {
                $join->on('fs.laporan_sekolah_id', '=', 'ls.id')
                    ->where('fs.jenis', '=', 'siswa_makan');
            })
            ->where('ls.sekolah_id', $id)
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
                    'jumlahPenerima' => (int) ($row->jumlah_penerima ?? 0),
                    'jumlahDikonsumsi' => (int) ($row->jumlah_dikonsumsi ?? 0),
                    'sisa' => (int) ($row->sisa ?? 0),
                    'keterangan' => $row->keterangan,
                    'lokasi' => [
                        'latitude' => $row->latitude !== null ? (float) $row->latitude : null,
                        'longitude' => $row->longitude !== null ? (float) $row->longitude : null,
                        'akurasi' => $row->akurasi !== null ? (float) $row->akurasi : null,
                        'alamat' => $row->lokasi_alamat ?? $school->alamat ?? '-',
                    ],
                    'fotoMenuUrl' => $row->foto_menu ? '/storage/' . $row->foto_menu : null,
                    'fotoSiswaUrl' => $row->foto_siswa ? '/storage/' . $row->foto_siswa : null,
                ];
            })
            ->values();

        return response()->json([
            'data' => [
                'id' => $school->id,
                'rank' => $school->id,
                'name' => $school->nama_sekolah,
                'type' => $school->jenis_sekolah ?? '-',
                'status' => ($school->status_program ?? 'Aktif') === 'Aktif' ? 'Active' : ($school->status_program ?? 'Aktif'),
                'kecamatan' => $school->nama_kecamatan ?? '-',
                'alamat' => $school->alamat ?? '-',
                'programStart' => $school->tanggal_bergabung,
                'jumlahSiswa' => (int) ($school->total_siswa ?? 0),
                'sppg' => [
                    'id' => $primarySppg->id ?? null,
                    'name' => $primarySppg->nama_sppg ?? '-',
                    'jenis' => $primarySppg->jenis_dapur ?? '-',
                    'kapasitas' => (int) ($primarySppg->kapasitas_harian ?? 0),
                ],
                'distribusi' => $distribusi,
                'reports' => $reports,
            ],
        ]);
    }
}
