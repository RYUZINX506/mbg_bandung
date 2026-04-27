<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GroupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        $query = DB::table('kelompok as g')
            ->leftJoin('kecamatan as k', 'k.id', '=', 'g.kecamatan_id')
            ->select([
                'g.id',
                'g.nama',
                'g.tipe',
                'g.jumlah_anggota',
                'k.nama_kecamatan',
            ]);

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                $builder->where('g.nama', 'like', "%{$search}%")
                    ->orWhere('k.nama_kecamatan', 'like', "%{$search}%");
            });
        }

        $groups = $query
            ->orderBy('g.nama')
            ->get()
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'name' => $row->nama,
                    'category' => $row->tipe ?? 'Kelompok',
                    'kecamatan' => $row->nama_kecamatan ?? '-',
                    'santri' => (int) ($row->jumlah_anggota ?? 0),
                    'kabupaten' => 'Bandung',
                ];
            });

        return response()->json(['data' => $groups]);
    }

    public function show(int $id): JsonResponse
    {
        $group = DB::table('kelompok as g')
            ->leftJoin('kecamatan as k', 'k.id', '=', 'g.kecamatan_id')
            ->leftJoin('status_program as sp', 'sp.id', '=', 'g.status_program_id')
            ->select([
                'g.id',
                'g.nama',
                'g.tipe',
                'g.deskripsi',
                'g.jumlah_anggota',
                'g.kode',
                'g.tanggal_bergabung',
                'k.id as kecamatan_id',
                'k.nama_kecamatan',
                'sp.nama as status_program',
            ])
            ->where('g.id', $id)
            ->first();

        if (! $group) {
            return response()->json(['message' => 'Kelompok tidak ditemukan.'], 404);
        }

        $sppgList = DB::table('sppg')
            ->where('kecamatan_id', $group->kecamatan_id)
            ->orderBy('nama_sppg')
            ->limit(3)
            ->get([
                'id',
                'nama_sppg',
                'alamat',
                'kapasitas_harian',
                'status_operasional',
                'nama_pengelola',
            ])
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'nama' => $row->nama_sppg,
                    'lokasi' => $row->alamat ?? '-',
                    'porsi' => ((int) ($row->kapasitas_harian ?? 0)) . ' porsi/hari',
                    'status' => $row->status_operasional ?? 'Aktif',
                    'penanggungjawab' => $row->nama_pengelola ?? '-',
                ];
            })
            ->values();

        return response()->json([
            'data' => [
                'id' => $group->id,
                'name' => $group->nama,
                'subtitle' => 'Kelompok Masyarakat',
                'description' => $group->deskripsi ?? 'Kelompok penerima manfaat MBG.',
                'icon' => '👥',
                'color' => '#16a34a',
                'jenis' => $group->tipe ?? 'Kelompok',
                'statusProgram' => $group->status_program ?? 'Aktif',
                'sppg' => [
                    'name' => $sppgList->first()['nama'] ?? '-',
                    'jumlah' => $sppgList->count() . ' SPPG',
                    'porsi' => $sppgList->first()['porsi'] ?? '-',
                    'status' => $sppgList->first()['status'] ?? '-',
                ],
                'infoDetail' => [
                    'jenis' => $group->tipe ?? 'Kelompok',
                    'lokasi' => $group->nama_kecamatan ?? '-',
                    'jumlahAnggota' => (int) ($group->jumlah_anggota ?? 0),
                    'nomorReg' => $group->kode ?? '-',
                    'statusProgram' => $group->status_program ?? 'Aktif',
                    'tanggalBergabung' => $group->tanggal_bergabung,
                ],
                'sppgDetail' => $sppgList,
                'distribusiDetail' => [
                    [
                        'hari' => 'Senin - Jumat',
                        'waktu' => '08:00 - 14:00 WIB',
                        'menu' => 'Sesuai menu terjadwal',
                        'jumlah' => 'Sesuai kebutuhan',
                    ],
                ],
            ],
        ]);
    }
}
