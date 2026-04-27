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
                's.fasilitas_dapur',
                's.sertifikat',
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
                ],
                'facilities' => $facilityList->isNotEmpty() ? $facilityList : ['Data fasilitas belum diisi'],
                'photos' => ['https://via.placeholder.com/260x160'],
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
                'servedSchools' => $servedSchools,
            ],
        ]);
    }
}
