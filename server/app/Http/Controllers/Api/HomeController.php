<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function index(): JsonResponse
    {
        $today = Carbon::today()->toDateString();

        $summary = [
            'sekolah' => DB::table('sekolah')->count(),
            'kelompok' => DB::table('kelompok')->count(),
            'sppg' => DB::table('sppg')->count(),
            'laporanSekolah' => DB::table('laporan_sekolah')->count(),
            'pengaduan' => DB::table('pengaduan')->count(),
            'totalPenerimaHariIni' => (int) DB::table('laporan_sekolah')
                ->whereDate('tanggal', $today)
                ->sum('jumlah_penerima'),
            'totalTargetPenerima' => (int) DB::table('sekolah')->sum('total_siswa'),
        ];

        $topSchools = DB::table('sekolah as s')
            ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
            ->orderByDesc('s.total_siswa')
            ->limit(5)
            ->get([
                's.id',
                's.nama_sekolah',
                's.jenis_sekolah',
                's.total_siswa',
                'k.nama_kecamatan',
            ])
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'name' => $row->nama_sekolah,
                    'type' => $row->jenis_sekolah ?? '-',
                    'kecamatan' => $row->nama_kecamatan ?? '-',
                    'siswa' => (int) ($row->total_siswa ?? 0),
                ];
            });

        $topSppg = DB::table('sppg as s')
            ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
            ->orderByDesc('s.kapasitas_harian')
            ->limit(5)
            ->get([
                's.id',
                's.nama_sppg',
                's.kapasitas_harian',
                'k.nama_kecamatan',
            ])
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'name' => $row->nama_sppg,
                    'kecamatan' => $row->nama_kecamatan ?? '-',
                    'kapasitas' => (int) ($row->kapasitas_harian ?? 0),
                ];
            });

        return response()->json([
            'data' => [
                'summary' => $summary,
                'topSchools' => $topSchools,
                'topSppg' => $topSppg,
            ],
        ]);
    }
}
