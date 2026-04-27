<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PanelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (! $user) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        $payload = [
            'user' => [
                'id' => $user->id,
                'kode' => $user->kode,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'sekolahId' => $user->sekolah_id ?? null,
                'sppgId' => $user->sppg_id ?? null,
            ],
            'summary' => [
                'sekolah' => DB::table('sekolah')->count(),
                'kelompok' => DB::table('kelompok')->count(),
                'sppg' => DB::table('sppg')->count(),
                'pengaduan' => DB::table('pengaduan')->count(),
            ],
            'roleScope' => $this->roleScope($user->role),
            'profile' => $this->buildProfile($user),
            'recent' => $this->buildRecentActivity($user),
            'options' => $this->buildOptions($user),
        ];

        if ($user->role === 'ahli_gizi') {
            $payload['roleScope']['assignedSppg'] = DB::table('sppg')
                ->where('ahli_gizi_id', $user->id)
                ->orderBy('nama_sppg')
                ->get(['id', 'nama_sppg', 'alamat', 'status_operasional']);
        }

        return response()->json(['data' => $payload]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if (! in_array($user->role, ['sekolah', 'sppg'], true)) {
            return response()->json(['message' => 'Panel ini hanya untuk sekolah atau SPPG.'], 403);
        }

        if ($user->role === 'sekolah') {
            $validated = $request->validate([
                'nama_sekolah' => ['nullable', 'string', 'max:255'],
                'alamat' => ['nullable', 'string'],
                'no_telepon' => ['nullable', 'string', 'max:50'],
                'email' => ['nullable', 'email', 'max:255'],
                'no_telepon_kepala_sekolah' => ['nullable', 'string', 'max:50'],
                'nama_kepala_sekolah' => ['nullable', 'string', 'max:255'],
                'jenis_sekolah' => ['nullable', 'string', 'max:100'],
                'desa_kelurahan' => ['nullable', 'string', 'max:100'],
                'total_siswa' => ['nullable', 'integer', 'min:0'],
                'kecamatan_id' => ['nullable', 'integer', 'exists:kecamatan,id'],
            ]);

            $schoolId = $user->sekolah_id;

            if (! $schoolId) {
                return response()->json(['message' => 'Akun sekolah belum terhubung ke data sekolah.'], 422);
            }

            DB::table('sekolah')->where('id', $schoolId)->update(array_filter($validated, fn ($value) => $value !== null && $value !== ''));

            return response()->json(['message' => 'Profil sekolah berhasil diperbarui.']);
        }

        $validated = $request->validate([
            'nama_pengelola' => ['nullable', 'string', 'max:255'],
            'alamat' => ['nullable', 'string'],
            'no_telepon_pengelola' => ['nullable', 'string', 'max:50'],
            'email_pengelola' => ['nullable', 'email', 'max:255'],
            'kapasitas_harian' => ['nullable', 'integer', 'min:0'],
            'fasilitas_dapur' => ['nullable', 'string', 'max:255'],
            'status_operasional' => ['nullable', 'string', 'max:100'],
            'desa_kelurahan' => ['nullable', 'string', 'max:100'],
            'jenis_dapur_id' => ['nullable', 'integer', 'exists:jenis_dapur,id'],
            'kecamatan_id' => ['nullable', 'integer', 'exists:kecamatan,id'],
        ]);

        $sppgId = $user->sppg_id;

        if (! $sppgId) {
            return response()->json(['message' => 'Akun SPPG belum terhubung ke data SPPG.'], 422);
        }

        DB::table('sppg')->where('id', $sppgId)->update(array_filter($validated, fn ($value) => $value !== null && $value !== ''));

        return response()->json(['message' => 'Profil SPPG berhasil diperbarui.']);
    }

    public function storeSchoolReport(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if ($user->role !== 'sekolah') {
            return response()->json(['message' => 'Hanya sekolah yang dapat mengirim laporan sekolah.'], 403);
        }

        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'jumlah_penerima' => ['nullable', 'integer', 'min:0'],
            'jumlah_dikonsumsi' => ['nullable', 'integer', 'min:0'],
            'sisa' => ['nullable', 'integer', 'min:0'],
            'keterangan' => ['nullable', 'string'],
            'foto_menu' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'foto_siswa_makan' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        if (! $user->sekolah_id) {
            return response()->json(['message' => 'Akun sekolah belum terhubung ke data sekolah.'], 422);
        }

        $menuPath = $request->file('foto_menu')->store('reports/school/menu', 'public');
        $studentPath = $request->file('foto_siswa_makan')->store('reports/school/student', 'public');

        DB::transaction(function () use ($user, $validated, $menuPath, $studentPath): void {
            $reportId = DB::table('laporan_sekolah')->insertGetId([
                'sekolah_id' => $user->sekolah_id,
                'tanggal' => $validated['tanggal'],
                'jumlah_penerima' => $validated['jumlah_penerima'] ?? null,
                'jumlah_dikonsumsi' => $validated['jumlah_dikonsumsi'] ?? null,
                'sisa' => $validated['sisa'] ?? null,
                'keterangan' => $validated['keterangan'] ?? null,
                'created_at' => now(),
            ]);

            DB::table('file_path')->insert([
                [
                    'laporan_sekolah_id' => $reportId,
                    'jenis' => 'menu',
                    'file' => $menuPath,
                    'created_at' => now(),
                ],
                [
                    'laporan_sekolah_id' => $reportId,
                    'jenis' => 'siswa_makan',
                    'file' => $studentPath,
                    'created_at' => now(),
                ],
            ]);
        });

        return response()->json(['message' => 'Laporan sekolah berhasil disimpan.'], 201);
    }

    public function storeDistribution(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if ($user->role !== 'sppg') {
            return response()->json(['message' => 'Hanya SPPG yang dapat mengirim laporan distribusi.'], 403);
        }

        $validated = $request->validate([
            'sekolah_id' => ['required', 'integer', 'exists:sekolah,id'],
            'tanggal' => ['required', 'date'],
            'porsi_distribusi' => ['nullable', 'integer', 'min:0'],
            'status_delivery' => ['nullable', 'string', 'max:100'],
            'status_terkirim' => ['nullable', 'string', 'max:100'],
            'menu' => ['nullable', 'string', 'max:255'],
            'kategori_menu' => ['nullable', 'string', 'max:100'],
        ]);

        if (! $user->sppg_id) {
            return response()->json(['message' => 'Akun SPPG belum terhubung ke data SPPG.'], 422);
        }

        $distributionId = DB::table('laporan_sppg')->insertGetId([
            'sppg_id' => $user->sppg_id,
            'sekolah_id' => $validated['sekolah_id'],
            'tanggal' => $validated['tanggal'],
            'porsi_distribusi' => $validated['porsi_distribusi'] ?? null,
            'status_delivery' => $validated['status_delivery'] ?? null,
            'status_terkirim' => $validated['status_terkirim'] ?? null,
            'distributed_by' => $user->id,
        ]);

        if (! empty($validated['menu'])) {
            DB::table('menu')->insert([
                'distribusi_id' => $distributionId,
                'deskripsi' => $validated['menu'],
                'kategori' => $validated['kategori_menu'] ?? null,
            ]);
        }

        return response()->json(['message' => 'Laporan distribusi berhasil disimpan.'], 201);
    }

    private function resolveUser(Request $request)
    {
        $token = $request->bearerToken();

        if (! $token) {
            return null;
        }

        return DB::table('users')
            ->where('api_token', hash('sha256', $token))
            ->first([
                'id',
                'kode',
                'name',
                'email',
                'role',
                'sekolah_id',
                'sppg_id',
            ]);
    }

    private function buildProfile(object $user): array
    {
        if ($user->role === 'sekolah' && $user->sekolah_id) {
            $school = DB::table('sekolah as s')
                ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
                ->leftJoin('status_program as sp', 'sp.id', '=', 's.status_program_id')
                ->select([
                    's.id',
                    's.kecamatan_id',
                    's.nama_sekolah',
                    's.alamat',
                    's.no_telepon',
                    's.email',
                    's.no_telepon_kepala_sekolah',
                    's.nama_kepala_sekolah',
                    's.jenis_sekolah',
                    's.desa_kelurahan',
                    's.total_siswa',
                    's.tanggal_bergabung',
                    'k.nama_kecamatan',
                    'sp.nama as status_program',
                ])
                ->where('s.id', $user->sekolah_id)
                ->first();

            return [
                'type' => 'sekolah',
                'record' => $school,
            ];
        }

        if ($user->role === 'sppg' && $user->sppg_id) {
            $sppg = DB::table('sppg as s')
                ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
                ->leftJoin('jenis_dapur as jd', 'jd.id', '=', 's.jenis_dapur_id')
                ->select([
                    's.id',
                    's.kecamatan_id',
                    's.jenis_dapur_id',
                    's.nama_sppg',
                    's.alamat',
                    's.no_telepon_pengelola',
                    's.email_pengelola',
                    's.nama_pengelola',
                    's.kapasitas_harian',
                    's.fasilitas_dapur',
                    's.status_operasional',
                    's.desa_kelurahan',
                    's.jenis_dapur_id',
                    's.jumlah_staf',
                    's.mulai_operasional',
                    'k.nama_kecamatan',
                    'jd.nama as jenis_dapur',
                ])
                ->where('s.id', $user->sppg_id)
                ->first();

            return [
                'type' => 'sppg',
                'record' => $sppg,
            ];
        }

        return [
            'type' => 'generic',
            'record' => null,
        ];
    }

    private function buildRecentActivity(object $user): array
    {
        if ($user->role === 'sekolah' && $user->sekolah_id) {
            return [
                'reports' => DB::table('laporan_sekolah as ls')
                    ->leftJoin('file_path as fm', function ($join): void {
                        $join->on('fm.laporan_sekolah_id', '=', 'ls.id')
                            ->where('fm.jenis', '=', 'menu');
                    })
                    ->leftJoin('file_path as fs', function ($join): void {
                        $join->on('fs.laporan_sekolah_id', '=', 'ls.id')
                            ->where('fs.jenis', '=', 'siswa_makan');
                    })
                    ->where('ls.sekolah_id', $user->sekolah_id)
                    ->orderByDesc('ls.tanggal')
                    ->limit(8)
                    ->get([
                        'ls.id',
                        'ls.tanggal',
                        'ls.jumlah_penerima',
                        'ls.jumlah_dikonsumsi',
                        'ls.sisa',
                        'ls.keterangan',
                        'fm.file as foto_menu',
                        'fs.file as foto_siswa_makan',
                        DB::raw("CONCAT('/storage/', fm.file) as foto_menu_url"),
                        DB::raw("CONCAT('/storage/', fs.file) as foto_siswa_makan_url"),
                    ]),
            ];
        }

        if ($user->role === 'sppg' && $user->sppg_id) {
            return [
                'reports' => DB::table('laporan_sppg as ls')
                    ->leftJoin('sekolah as s', 's.id', '=', 'ls.sekolah_id')
                    ->leftJoin('menu as m', 'm.distribusi_id', '=', 'ls.id')
                    ->where('ls.sppg_id', $user->sppg_id)
                    ->orderByDesc('ls.tanggal')
                    ->orderByDesc('ls.id')
                    ->limit(8)
                    ->get([
                        'ls.id',
                        'ls.tanggal',
                        'ls.porsi_distribusi',
                        'ls.status_delivery',
                        'ls.status_terkirim',
                        's.nama_sekolah as sekolah_nama',
                        'm.deskripsi as menu_deskripsi',
                    ]),
            ];
        }

        return ['reports' => []];
    }

    private function buildOptions(object $user): array
    {
        $kecamatan = DB::table('kecamatan')->orderBy('nama_kecamatan')->get(['id', 'nama_kecamatan']);
        $jenisDapur = DB::table('jenis_dapur')->orderBy('nama')->get(['id', 'nama']);
        $sekolah = DB::table('sekolah')->orderBy('nama_sekolah')->get(['id', 'nama_sekolah', 'jenis_sekolah', 'alamat']);

        return [
            'kecamatan' => $kecamatan,
            'jenisDapur' => $jenisDapur,
            'sekolah' => $sekolah,
            'role' => $user->role,
        ];
    }

    private function roleScope(?string $role): array
    {
        return match ($role) {
            'admin' => [
                'title' => 'Panel Admin',
                'description' => 'Ringkasan seluruh modul program.',
            ],
            'sppg' => [
                'title' => 'Panel SPPG',
                'description' => 'Data dapur, distribusi, dan laporan.',
            ],
            'sekolah' => [
                'title' => 'Panel Sekolah',
                'description' => 'Data sekolah, distribusi, dan laporan sekolah.',
            ],
            'ahli_gizi' => [
                'title' => 'Panel Ahli Gizi',
                'description' => 'SPPG yang ditangani dan aktivitas terkait.',
            ],
            default => [
                'title' => 'Panel Pengguna',
                'description' => 'Ringkasan akun Anda.',
            ],
        };
    }
}
