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
        $date = request('date') ?: Carbon::today()->toDateString();
        $totalSekolah = DB::table('sekolah')->count();
        $totalSekolahAktif = DB::table('sekolah as s')
            ->leftJoin('status_program as sp', 'sp.id', '=', 's.status_program_id')
            ->where(function ($query): void {
                $query->whereRaw("LOWER(TRIM(COALESCE(sp.nama, ''))) = ?", ['aktif'])
                    ->orWhereNull('s.status_program_id');
            })
            ->count();

        $activeSppgCount = DB::table('sppg')
            ->whereRaw("LOWER(TRIM(COALESCE(status_operasional, ''))) = ?", ['aktif'])
            ->count();

        $activeSppgLaporHariIni = DB::table('laporan_sppg as ls')
            ->join('sppg as s', 's.id', '=', 'ls.sppg_id')
            ->whereDate('ls.tanggal', $date)
            ->whereRaw("LOWER(TRIM(COALESCE(s.status_operasional, ''))) = ?", ['aktif'])
            ->distinct('ls.sppg_id')
            ->count('ls.sppg_id');

        $sekolahLaporHariIni = DB::table('laporan_sekolah as ls')
            ->join('sekolah as s', 's.id', '=', 'ls.sekolah_id')
            ->leftJoin('status_program as sp', 'sp.id', '=', 's.status_program_id')
            ->whereDate('ls.tanggal', $date)
            ->where(function ($query): void {
                $query->whereRaw("LOWER(TRIM(COALESCE(sp.nama, ''))) = ?", ['aktif'])
                    ->orWhereNull('s.status_program_id');
            })
            ->distinct('ls.sekolah_id')
            ->count('ls.sekolah_id');

        $totalPenerimaKelompok = (int) DB::table('kelompok')->sum('jumlah_anggota');
        $bumilKelompok = (int) DB::table('kelompok')
            ->whereRaw("LOWER(TRIM(COALESCE(tipe, ''))) LIKE ?", ['%bumil%'])
            ->sum('jumlah_anggota');
        $balitaKelompok = (int) DB::table('kelompok')
            ->whereRaw("LOWER(TRIM(COALESCE(tipe, ''))) LIKE ?", ['%balita%'])
            ->sum('jumlah_anggota');
        $busuiKelompok = (int) DB::table('kelompok')
            ->whereRaw("LOWER(TRIM(COALESCE(tipe, ''))) LIKE ?", ['%busui%'])
            ->sum('jumlah_anggota');

        $summary = [
            'sekolah' => $totalSekolah,
            'sekolahAktif' => $totalSekolahAktif,
            'kelompok' => DB::table('kelompok')->count(),
            'totalPenerimaKelompok' => $totalPenerimaKelompok,
            'kelompokBumil' => $bumilKelompok,
            'kelompokBalita' => $balitaKelompok,
            'kelompokBusui' => $busuiKelompok,
            'sppg' => $activeSppgCount,
            'totalSppg' => DB::table('sppg')->count(),
            'sppgLaporHariIni' => $activeSppgLaporHariIni,
            'sppgBelumLapor' => max(0, $activeSppgCount - $activeSppgLaporHariIni),
            'sekolahLaporHariIni' => $sekolahLaporHariIni,
            'sekolahBelumLapor' => max(0, $totalSekolahAktif - $sekolahLaporHariIni),
            'laporanSekolah' => DB::table('laporan_sekolah')->count(),
            'pengaduan' => DB::table('pengaduan')->count(),
            'totalPenerimaHariIni' => (int) DB::table('laporan_sekolah')
                ->whereDate('tanggal', $date)
                ->sum('jumlah_penerima'),
            'totalTargetPenerima' => (int) DB::table('sekolah')->sum('total_siswa'),
            'totalDistribusiPorsiHariIni' => (int) DB::table('laporan_sppg')
                ->whereDate('tanggal', $date)
                ->sum('porsi_distribusi'),
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
            ->whereExists(function ($query) use ($date) {
                $query->select(DB::raw(1))
                    ->from('laporan_sppg as ls')
                    ->whereColumn('ls.sppg_id', 's.id')
                    ->whereDate('ls.tanggal', $date);
            })
            ->orderBy('s.nama_sppg')
            ->get([
                's.id',
                's.nama_sppg',
                's.kapasitas_harian',
                'k.nama_kecamatan',
            ])
            ->map(function ($row) use ($date) {
                // Get latest laporan for this SPPG on the selected date
                $laporanForDate = DB::table('laporan_sppg')
                    ->where('sppg_id', $row->id)
                    ->whereDate('tanggal', $date)
                    ->select('id', 'sppg_id', 'sekolah_id', 'tanggal', 'porsi_distribusi', 'status_delivery', 'status_terkirim', 'created_at', 'updated_at')
                    ->orderByDesc('created_at')
                    ->get();
                
                // Put the latest first, then others
                $laporan = $laporanForDate;
                
                return [
                    'id' => $row->id,
                    'name' => $row->nama_sppg,
                    'kecamatan' => $row->nama_kecamatan ?? '-',
                    'kapasitas' => (int) ($row->kapasitas_harian ?? 0),
                    'laporan_harian' => $laporan,
                ];
            });

        $schoolReportsToday = DB::table('laporan_sekolah as ls')
            ->join('sekolah as s', 's.id', '=', 'ls.sekolah_id')
            ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
            ->leftJoin('file_path as fp', 'fp.laporan_sekolah_id', '=', 'ls.id')
            ->whereDate('ls.tanggal', $date)
            ->groupBy(
                'ls.id',
                'ls.tanggal',
                's.id',
                's.nama_sekolah',
                's.jenis_sekolah',
                'k.nama_kecamatan'
            )
            ->orderByDesc('ls.tanggal')
            ->selectRaw(
                'ls.id, ls.tanggal, s.id as sekolah_id, s.nama_sekolah, s.jenis_sekolah, k.nama_kecamatan, '
                . "MAX(CASE WHEN fp.jenis = 'menu' THEN 1 ELSE 0 END) as has_menu_photo, "
                . "MAX(CASE WHEN fp.jenis = 'siswa_makan' THEN 1 ELSE 0 END) as has_student_photo, "
                . "MAX(CASE WHEN fp.jenis = 'menu' THEN CONCAT('/storage/', fp.file) ELSE NULL END) as foto_menu_url, "
                . "MAX(CASE WHEN fp.jenis = 'siswa_makan' THEN CONCAT('/storage/', fp.file) ELSE NULL END) as foto_siswa_makan_url"
            )
            ->get()
            ->map(function ($row) {
                return [
                    'id' => (int) $row->id,
                    'schoolId' => (int) $row->sekolah_id,
                    'name' => $row->nama_sekolah,
                    'type' => $row->jenis_sekolah ?? '-',
                    'kecamatan' => $row->nama_kecamatan ?? '-',
                    'tanggal' => (string) $row->tanggal,
                    'updatedAt' => (string) ($row->created_at ?? $row->tanggal),
                    'hasMainPhoto' => ((int) $row->has_menu_photo) === 1,
                    'hasSecondaryPhoto' => ((int) $row->has_student_photo) === 1,
                    'fotoMenuUrl' => $row->foto_menu_url ? (string) $row->foto_menu_url : null,
                    'fotoSiswaUrl' => $row->foto_siswa_makan_url ? (string) $row->foto_siswa_makan_url : null,
                ];
            });

        // Aggregate distributions grouped by tujuan (sekolah) for the selected date
        $distributionsBySchool = DB::table('laporan_sppg as ls')
            ->join('sekolah as s', 's.id', '=', 'ls.sekolah_id')
            ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
            ->whereDate('ls.tanggal', $date)
            ->groupBy('s.id', 's.nama_sekolah', 's.jenis_sekolah', 'k.nama_kecamatan')
            ->selectRaw(
                's.id as sekolah_id, s.nama_sekolah, s.jenis_sekolah, k.nama_kecamatan, '
                . 'SUM(ls.porsi_distribusi) as total_porsi, '
                . 'COUNT(DISTINCT ls.sppg_id) as sppg_count, '
                . 'MAX(ls.created_at) as last_updated'
            )
            ->orderByDesc('total_porsi')
            ->get()
            ->map(function ($row) {
                return [
                    'schoolId' => (int) $row->sekolah_id,
                    'name' => $row->nama_sekolah,
                    'type' => $row->jenis_sekolah ?? '-',
                    'kecamatan' => $row->nama_kecamatan ?? '-',
                    'totalPorsi' => (int) ($row->total_porsi ?? 0),
                    'sppgCount' => (int) ($row->sppg_count ?? 0),
                    'lastUpdated' => $row->last_updated ? (string) $row->last_updated : null,
                ];
            });

        return response()->json([
            'data' => [
                'summary' => $summary,
                'topSchools' => $topSchools,
                'topSppg' => $topSppg,
                'schoolReportsToday' => $schoolReportsToday,
                'distributionsBySchool' => $distributionsBySchool,
            ],
        ]);
    }
}
