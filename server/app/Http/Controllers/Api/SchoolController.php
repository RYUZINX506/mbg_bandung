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
            ->leftJoin('menu as m', 'm.distribusi_id', '=', 'ls.id')
            ->select([
                'ls.id',
                'ls.tanggal',
                'ls.porsi_distribusi',
                'm.deskripsi as menu_deskripsi',
            ])
            ->where('ls.sekolah_id', $id)
            ->orderByDesc('ls.tanggal')
            ->orderByDesc('ls.id')
            ->get()
            ->groupBy('id')
            ->map(function ($rows, $distribusiId) {
                $first = $rows->first();
                $menu = $rows->pluck('menu_deskripsi')->filter()->unique()->values()->implode(', ');

                return [
                    'id' => (int) $distribusiId,
                    'tanggal' => (string) $first->tanggal,
                    'menu' => $menu !== '' ? $menu : 'Menu belum diinput',
                    'porsi' => (int) ($first->porsi_distribusi ?? 0),
                    'jam' => '-',
                ];
            })
            ->values();

        $reports = DB::table('laporan_sekolah')
            ->where('sekolah_id', $id)
            ->orderByDesc('tanggal')
            ->get([
                'id',
                'tanggal',
                'jumlah_penerima',
                'jumlah_dikonsumsi',
                'sisa',
                'keterangan',
            ])
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'tanggal' => (string) $row->tanggal,
                    'jumlahPenerima' => (int) ($row->jumlah_penerima ?? 0),
                    'jumlahDikonsumsi' => (int) ($row->jumlah_dikonsumsi ?? 0),
                    'sisa' => (int) ($row->sisa ?? 0),
                    'keterangan' => $row->keterangan,
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
                    'nama' => $primarySppg->nama_sppg ?? '-',
                    'jenis' => $primarySppg->jenis_dapur ?? '-',
                    'kapasitas' => (int) ($primarySppg->kapasitas_harian ?? 0),
                ],
                'distribusi' => $distribusi,
                'reports' => $reports,
            ],
        ]);
    }
}
