<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;

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
            'nama_sppg' => ['nullable', 'string', 'max:255'],
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
            'sppg_id' => ['required', 'integer', 'exists:sppg,id'],
            'jumlah_penerima' => ['nullable', 'integer', 'min:0'],
            'jumlah_dikonsumsi' => ['nullable', 'integer', 'min:0'],
            'sisa' => ['nullable', 'integer', 'min:0'],
            'keterangan' => ['nullable', 'string'],
            'foto_menu' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'foto_siswa_makan' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'foto_porsi_rusak' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        if (! $user->sekolah_id) {
            return response()->json(['message' => 'Akun sekolah belum terhubung ke data sekolah.'], 422);
        }

        $school = DB::table('sekolah')
            ->where('id', $user->sekolah_id)
            ->first([
                'id',
                'nama_sekolah',
                'alamat',
                'latitude',
                'longitude',
            ]);

        if (! $school) {
            return response()->json(['message' => 'Data sekolah tidak ditemukan.'], 422);
        }

        $isLinkedSppg = DB::table('laporan_sppg')
            ->where('sekolah_id', $user->sekolah_id)
            ->where('sppg_id', $validated['sppg_id'])
            ->exists();

        if (! $isLinkedSppg) {
            return response()->json(['message' => 'SPPG yang dipilih tidak terhubung dengan sekolah ini.'], 422);
        }

        $damagedPortion = (int) ($validated['sisa'] ?? 0);
        if ($damagedPortion > 0 && ! $request->hasFile('foto_porsi_rusak')) {
            return response()->json(['message' => 'Foto porsi rusak wajib diunggah jika jumlah porsi rusak diisi.'], 422);
        }

        if ($damagedPortion === 0 && $request->hasFile('foto_porsi_rusak')) {
            return response()->json(['message' => 'Isi jumlah porsi rusak jika mengunggah foto porsi rusak.'], 422);
        }

        $menuPath = $request->file('foto_menu')->store('reports/school/menu', 'public');
        $studentPath = $request->file('foto_siswa_makan')->store('reports/school/student', 'public');
        $damagedPath = $request->hasFile('foto_porsi_rusak')
            ? $request->file('foto_porsi_rusak')->store('reports/school/damaged', 'public')
            : null;

        DB::transaction(function () use ($user, $school, $validated, $menuPath, $studentPath, $damagedPath): void {
            $reportId = DB::table('laporan_sekolah')->insertGetId([
                'sekolah_id' => $user->sekolah_id,
                'tanggal' => $validated['tanggal'],
                'jumlah_penerima' => $validated['jumlah_penerima'] ?? null,
                'jumlah_dikonsumsi' => $validated['jumlah_dikonsumsi'] ?? null,
                'sisa' => $validated['sisa'] ?? null,
                'keterangan' => $validated['keterangan'] ?? null,
                'created_at' => now(),
            ]);

            $latitude = (float) ($school->latitude ?? 0);
            $longitude = (float) ($school->longitude ?? 0);

            DB::table('laporan_lokasi')->updateOrInsert(
                ['laporan_sekolah_id' => $reportId],
                [
                    'laporan_sekolah_id' => $reportId,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'akurasi' => 12.50,
                    'alamat' => $school->alamat ?? null,
                ]
            );

            $files = [
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
            ];

            if ($damagedPath) {
                $files[] = [
                    'laporan_sekolah_id' => $reportId,
                    'jenis' => 'porsi_rusak',
                    'file' => $damagedPath,
                    'created_at' => now(),
                ];
            }

            DB::table('file_path')->insert($files);
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
            'tanggal' => ['required', 'date'],
            'sekolah_id' => ['nullable', 'integer', 'exists:sekolah,id'],
            'porsi_distribusi' => ['nullable', 'integer', 'min:1'],
            'menu_id' => ['nullable', 'integer', 'exists:menu,id'],
            'menu' => ['nullable', 'array'],
            'menu.deskripsi' => ['required_without:menu_id', 'string'],
            'menu.bahan_baku_id' => ['nullable', 'integer', 'exists:bahanbaku,id'],
            'bahan_baku' => ['nullable', 'array'],
            'bahan_baku.*.nama' => ['nullable', 'string', 'max:191'],
            'bahan_baku.*.jumlah' => ['nullable', 'string', 'max:191'],
            'menu.kalori' => ['nullable', 'integer', 'min:0'],
            'menu.protein' => ['nullable', 'integer', 'min:0'],
            'menu.karbohidrat' => ['nullable', 'integer', 'min:0'],
            'menu.lemak' => ['nullable', 'integer', 'min:0'],
            'menu.jumlah' => ['nullable', 'integer', 'min:1'],
            'distributions' => ['nullable', 'array'],
            'distributions.*.sekolah_id' => ['required_with:distributions', 'integer', 'exists:sekolah,id'],
            'distributions.*.porsi_distribusi' => ['required_with:distributions', 'integer', 'min:1'],
            'distributions.*.keterangan' => ['nullable', 'string'],
        ]);

        if (! $user->sppg_id) {
            return response()->json(['message' => 'Akun SPPG belum terhubung ke data SPPG.'], 422);
        }

        $distributionItems = collect($validated['distributions'] ?? [])->map(function (array $item): array {
            return [
                'sekolah_id' => (int) $item['sekolah_id'],
                'porsi_distribusi' => (int) $item['porsi_distribusi'],
            ];
        })->keyBy('sekolah_id')->values()->all();

        if ($distributionItems === [] && ! empty($validated['sekolah_id'] ?? null)) {
            if (! isset($validated['porsi_distribusi']) || (int) $validated['porsi_distribusi'] < 1) {
                return response()->json(['message' => 'Porsi distribusi wajib diisi.'], 422);
            }

            $distributionItems[] = [
                'sekolah_id' => (int) $validated['sekolah_id'],
                'porsi_distribusi' => (int) $validated['porsi_distribusi'],
            ];
        }

        if ($distributionItems === []) {
            return response()->json(['message' => 'Pilih minimal satu sekolah untuk distribusi.'], 422);
        }

        $menuPayload = is_array($validated['menu'] ?? null) ? $validated['menu'] : [];

        // Verify menu_id belongs to this SPPG if provided. If the menu table
        // doesn't have `sppg_id` (older migrations), fall back to basic existence check.
        if (! empty($validated['menu_id'] ?? null)) {
            if (Schema::hasColumn('menu', 'sppg_id')) {
                $menuExists = DB::table('menu')
                    ->where('id', $validated['menu_id'])
                    ->where('sppg_id', $user->sppg_id)
                    ->exists();
            } else {
                $menuExists = DB::table('menu')
                    ->where('id', $validated['menu_id'])
                    ->exists();
            }

            if (! $menuExists) {
                return response()->json(['message' => 'Menu tidak ditemukan atau bukan milik SPPG Anda.'], 422);
            }
        }

        $fotoMenuPath = null;
        if ($request->hasFile('foto_menu')) {
            $fotoMenuPath = $request->file('foto_menu')->store('reports/sppg/menu', 'public');
        }

        $totalDistributions = DB::transaction(function () use ($user, $validated, $distributionItems, $menuPayload, $fotoMenuPath): int {
            $menuId = $validated['menu_id'] ?? null;
            $persistedBahanBakuIds = [];
            $selectedMenu = null;

            foreach ($validated['bahan_baku'] ?? [] as $bahanBakuInput) {
                if (! is_array($bahanBakuInput)) {
                    continue;
                }

                $nama = trim((string) ($bahanBakuInput['nama'] ?? ''));

                if ($nama === '') {
                    continue;
                }

                $jumlah = trim((string) ($bahanBakuInput['jumlah'] ?? ''));

                $existingBahanBaku = DB::table('bahanbaku')
                    ->whereRaw('LOWER(TRIM(nama)) = ?', [mb_strtolower($nama)])
                    ->first(['id']);

                if ($existingBahanBaku) {
                    $persistedBahanBakuIds[] = (int) $existingBahanBaku->id;
                    continue;
                }

                $bahanBakuInsert = [
                    'nama' => $nama,
                    'ketersediaan' => $jumlah !== '' ? $jumlah : null,
                    'deskripsi' => 'Diinput dari laporan distribusi',
                ];

                if (Schema::hasColumn('bahanbaku', 'created_at')) {
                    $bahanBakuInsert['created_at'] = now();
                }

                if (Schema::hasColumn('bahanbaku', 'updated_at')) {
                    $bahanBakuInsert['updated_at'] = now();
                }

                $insertedId = DB::table('bahanbaku')->insertGetId($bahanBakuInsert);

                $persistedBahanBakuIds[] = (int) $insertedId;
            }

            if ($menuId) {
                $selectedMenu = DB::table('menu')
                    ->where('id', $menuId)
                    ->first(['kalori', 'protein', 'karbohidrat', 'lemak']);
            }

            if (! $menuId && filled($menuPayload['deskripsi'] ?? null)) {
                $menuInsert = [
                    'deskripsi' => $menuPayload['deskripsi'],
                    'kalori' => $menuPayload['kalori'] ?? null,
                    'protein' => $menuPayload['protein'] ?? null,
                    'karbohidrat' => $menuPayload['karbohidrat'] ?? null,
                    'lemak' => $menuPayload['lemak'] ?? null,
                    'jumlah' => $menuPayload['jumlah'] ?? null,
                ];

                if (Schema::hasColumn('menu', 'sppg_id')) {
                    $menuInsert['sppg_id'] = $user->sppg_id;
                }

                if (Schema::hasColumn('menu', 'bahan_baku_id')) {
                    $menuInsert['bahan_baku_id'] = $persistedBahanBakuIds[0] ?? ($menuPayload['bahan_baku_id'] ?? null);
                }

                $menuId = DB::table('menu')->insertGetId($menuInsert);

                DB::table('menu')
                    ->where('id', $menuId)
                    ->update(['code' => (string) $menuId]);
            }

            $bahanBakuId = $menuPayload['bahan_baku_id'] ?? $persistedBahanBakuIds[0] ?? null;
            $nutritionPayload = [
                'kalori' => $selectedMenu?->kalori ?? $menuPayload['kalori'] ?? null,
                'protein' => $selectedMenu?->protein ?? $menuPayload['protein'] ?? null,
                'karbo' => $selectedMenu?->karbohidrat ?? $menuPayload['karbohidrat'] ?? null,
                'lemak' => $selectedMenu?->lemak ?? $menuPayload['lemak'] ?? null,
            ];

            foreach ($distributionItems as $distributionItem) {
                DB::table('laporan_sppg')->insert([
                    'sppg_id' => $user->sppg_id,
                    'sekolah_id' => $distributionItem['sekolah_id'],
                    'bahan_baku_id' => $bahanBakuId,
                    'tanggal' => $validated['tanggal'],
                    'porsi_distribusi' => $distributionItem['porsi_distribusi'],
                    'kalori' => $nutritionPayload['kalori'],
                    'protein' => $nutritionPayload['protein'],
                    'karbo' => $nutritionPayload['karbo'],
                    'lemak' => $nutritionPayload['lemak'],
                    'menu_id' => $menuId,
                    'keterangan' => $distributionItem['keterangan'] ?? null,
                    'foto_menu' => $fotoMenuPath,
                    'distributed_by' => $user->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return count($distributionItems);
        });

        return response()->json([
            'message' => "Laporan distribusi berhasil disimpan untuk {$totalDistributions} sekolah.",
        ], 201);
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
        $bahanBaku = DB::table('bahanbaku')->orderBy('nama')->get(['id', 'nama']);
        $sekolah = DB::table('sekolah')->orderBy('nama_sekolah')->get(['id', 'nama_sekolah', 'jenis_sekolah', 'alamat']);
        
        $menus = [];
        $sppg = [];
        if ($user->role === 'sekolah' && $user->sekolah_id) {
            $sppg = DB::table('laporan_sppg as ls')
                ->join('sppg as s', 's.id', '=', 'ls.sppg_id')
                ->where('ls.sekolah_id', $user->sekolah_id)
                ->groupBy('s.id', 's.nama_sppg', 's.kode_sppg')
                ->orderBy('s.nama_sppg')
                ->get(['s.id', 's.nama_sppg', 's.kode_sppg'])
                ->toArray();
        }

        if ($user->role === 'sppg' && $user->sppg_id) {
            $query = DB::table('menu')->whereNull('distribusi_id');
            if (Schema::hasColumn('menu', 'sppg_id')) {
                $query = $query->where('sppg_id', $user->sppg_id);
            }

            $menus = $query->orderBy('id', 'desc')
                ->get(['id', 'code', 'deskripsi', 'kalori', 'protein', 'karbohidrat', 'lemak', 'jumlah'])
                ->toArray();

            $linkedSchools = DB::table('laporan_sppg as ls')
                ->join('sekolah as s', 's.id', '=', 'ls.sekolah_id')
                ->where('ls.sppg_id', $user->sppg_id)
                ->groupBy('s.id', 's.nama_sekolah', 's.jenis_sekolah', 's.alamat')
                ->orderBy('s.nama_sekolah')
                ->get(['s.id', 's.nama_sekolah', 's.jenis_sekolah', 's.alamat']);

            $sekolah = $linkedSchools->toArray();
        }

        return [
            'kecamatan' => $kecamatan,
            'jenisDapur' => $jenisDapur,
            'bahanBaku' => $bahanBaku,
            'sekolah' => $sekolah,
            'sppg' => $sppg,
            'menus' => $menus,
            'role' => $user->role,
        ];
    }

    /**
     * Add new menu for SPPG
     */
    public function storeMenu(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if ($user->role !== 'sppg') {
            return response()->json(['message' => 'Hanya SPPG yang dapat membuat menu.'], 403);
        }

        if (! $user->sppg_id) {
            return response()->json(['message' => 'Akun SPPG belum terhubung ke data SPPG.'], 422);
        }

        $validated = $request->validate([
            'deskripsi' => ['required', 'string'],
            'kalori' => ['nullable', 'integer', 'min:0'],
            'protein' => ['nullable', 'integer', 'min:0'],
            'karbohidrat' => ['nullable', 'integer', 'min:0'],
            'lemak' => ['nullable', 'integer', 'min:0'],
            'jumlah' => ['nullable', 'integer', 'min:0'],
        ]);

        $insertData = [
            'deskripsi' => $validated['deskripsi'],
            'kalori' => $validated['kalori'] ?? null,
            'protein' => $validated['protein'] ?? null,
            'karbohidrat' => $validated['karbohidrat'] ?? null,
            'lemak' => $validated['lemak'] ?? null,
            'jumlah' => $validated['jumlah'] ?? null,
        ];

        if (Schema::hasColumn('menu', 'sppg_id')) {
            $insertData['sppg_id'] = $user->sppg_id;
        }

        $menuId = DB::table('menu')->insertGetId($insertData);

        DB::table('menu')
            ->where('id', $menuId)
            ->update(['code' => (string) $menuId]);

        return response()->json([
            'message' => 'Menu berhasil ditambahkan.',
            'id' => $menuId,
        ], 201);
    }

    /**
     * Add new bahan baku (allow SPPG to suggest/add)
     */
    public function storeBahanBaku(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if ($user->role !== 'sppg' && $user->role !== 'admin' && $user->role !== 'superadmin') {
            return response()->json(['message' => 'Hanya SPPG atau admin yang dapat menambahkan bahan baku.'], 403);
        }

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:191'],
            'kategori' => ['nullable', 'string', 'max:191'],
            'ketersediaan' => ['nullable', 'string', 'max:191'],
        ]);

        $nama = trim((string) ($validated['nama'] ?? ''));

        if ($nama === '') {
            return response()->json(['message' => 'Nama bahan baku wajib diisi.'], 422);
        }

        $existing = DB::table('bahanbaku')->whereRaw('LOWER(TRIM(nama)) = ?', [mb_strtolower($nama)])->exists();

        if ($existing) {
            return response()->json(['message' => 'Bahan baku dengan nama yang sama sudah ada.'], 422);
        }

        $insertId = DB::table('bahanbaku')->insertGetId([
            'nama' => $nama,
            'kategori' => trim((string) ($validated['kategori'] ?? '')) === '' ? null : trim((string) $validated['kategori']),
            'ketersediaan' => trim((string) ($validated['ketersediaan'] ?? '')) === '' ? null : trim((string) $validated['ketersediaan']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $record = DB::table('bahanbaku')->where('id', $insertId)->first(['id', 'nama', 'kategori', 'ketersediaan']);

        return response()->json([
            'message' => 'Bahan baku berhasil ditambahkan.',
            'data' => $record,
        ], 201);
    }

    /**
     * List menus for current SPPG
     */
    public function listMenus(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if ($user->role !== 'sppg') {
            return response()->json(['message' => 'Hanya SPPG yang dapat melihat menu.'], 403);
        }

        if (! $user->sppg_id) {
            return response()->json(['message' => 'Akun SPPG belum terhubung ke data SPPG.'], 422);
        }

        $query = DB::table('menu')->whereNull('distribusi_id');
        if (Schema::hasColumn('menu', 'sppg_id')) {
            $query = $query->where('sppg_id', $user->sppg_id);
        }

        $menus = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'data' => $menus,
        ]);
    }

    /**
     * Delete menu
     */
    public function deleteMenu(Request $request, int $menuId): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if ($user->role !== 'sppg') {
            return response()->json(['message' => 'Hanya SPPG yang dapat menghapus menu.'], 403);
        }

        if (! $user->sppg_id) {
            return response()->json(['message' => 'Akun SPPG belum terhubung ke data SPPG.'], 422);
        }

        $deleted = DB::table('menu')
            ->where('id', $menuId)
            ->where('sppg_id', $user->sppg_id)
            ->delete();

        if ($deleted === 0) {
            return response()->json(['message' => 'Menu tidak ditemukan atau Anda tidak memiliki akses.'], 404);
        }

        return response()->json([
            'message' => 'Menu berhasil dihapus.',
        ]);
    }

    /**
     * Get list laporan sekolah - untuk card display
     */
    public function listSchoolReports(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if ($user->role !== 'sekolah') {
            return response()->json(['message' => 'Hanya sekolah yang dapat melihat laporan sekolah.'], 403);
        }

        if (! $user->sekolah_id) {
            return response()->json(['message' => 'Akun sekolah belum terhubung ke data sekolah.'], 422);
        }

        $perPage = max(1, min(50, (int) $request->query('per_page', 10)));
        $page = max(1, (int) $request->query('page', 1));

        // Get school info
        $school = DB::table('sekolah')
            ->where('id', $user->sekolah_id)
            ->first(['id', 'nama_sekolah', 'jenis_sekolah']);

        // Get all laporan sekolah with pagination
        $pagination = DB::table('laporan_sekolah as ls')
            ->where('ls.sekolah_id', $user->sekolah_id)
            ->orderByDesc('ls.tanggal')
            ->orderByDesc('ls.id')
            ->paginate($perPage, ['*'], 'page', $page);

        // Build list for card display
        $reports = collect($pagination->items())->map(function ($laporan) {
            return [
                'id' => $laporan->id,
                'tanggal' => $laporan->tanggal,
                'waktu' => Carbon::parse($laporan->created_at)->format('H.i'),
                'jumlah_penerima' => $laporan->jumlah_penerima,
                'jumlah_dikonsumsi' => $laporan->jumlah_dikonsumsi,
                'sisa' => $laporan->sisa,
                'keterangan' => $laporan->keterangan,
                'created_at' => $laporan->created_at,
            ];
        });

        return response()->json([
            'data' => [
                'sekolah' => $school,
                'laporan' => $reports,
            ],
            'meta' => [
                'currentPage' => $pagination->currentPage(),
                'lastPage' => $pagination->lastPage(),
                'perPage' => $pagination->perPage(),
                'total' => $pagination->total(),
                'from' => $pagination->currentPage(),
                'to' => $pagination->lastPage(),
            ],
        ]);
    }

    /**
     * Get list laporan distribusi - untuk card display
     */
    public function listDistributions(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if ($user->role !== 'sppg') {
            return response()->json(['message' => 'Hanya SPPG yang dapat melihat laporan distribusi.'], 403);
        }

        if (! $user->sppg_id) {
            return response()->json(['message' => 'Akun SPPG belum terhubung ke data SPPG.'], 422);
        }

        $perPage = max(1, min(50, (int) $request->query('per_page', 10)));
        $page = max(1, (int) $request->query('page', 1));

        // Get SPPG info
        $sppg = DB::table('sppg')
            ->where('id', $user->sppg_id)
            ->first(['id', 'nama_sppg', 'kode_sppg']);

        // Get all laporan distribusi with pagination
        $pagination = DB::table('laporan_sppg as ls')
            ->leftJoin('sekolah as s', 's.id', '=', 'ls.sekolah_id')
            ->where('ls.sppg_id', $user->sppg_id)
            ->select([
                'ls.id',
                'ls.tanggal',
                'ls.porsi_distribusi',
                'ls.status_delivery',
                'ls.status_terkirim',
                'ls.foto_menu',
                'ls.created_at',
                's.nama_sekolah',
                's.jenis_sekolah',
            ])
            ->orderByDesc('ls.tanggal')
            ->orderByDesc('ls.id')
            ->paginate($perPage, ['*'], 'page', $page);

        // Build list for card display
        $distributions = collect($pagination->items())->map(function ($laporan) {
            return [
                'id' => $laporan->id,
                'tanggal' => $laporan->tanggal,
                'waktu' => Carbon::parse($laporan->created_at)->format('H.i'),
                'sekolah' => $laporan->nama_sekolah,
                'jenisSekolah' => $laporan->jenis_sekolah,
                'porsi' => $laporan->porsi_distribusi,
                'status_delivery' => $laporan->status_delivery,
                'status_terkirim' => $laporan->status_terkirim,
                'fotoMenuUrl' => $laporan->foto_menu ? '/storage/' . $laporan->foto_menu : null,
            ];
        });

        return response()->json([
            'data' => [
                'sppg' => $sppg,
                'distribusi' => $distributions,
            ],
            'meta' => [
                'currentPage' => $pagination->currentPage(),
                'lastPage' => $pagination->lastPage(),
                'perPage' => $pagination->perPage(),
                'total' => $pagination->total(),
                'from' => $pagination->currentPage(),
                'to' => $pagination->lastPage(),
            ],
        ]);
    }

    /**
     * Get detail laporan sekolah - untuk halaman detail
     */
    public function showSchoolReport(Request $request, int $id): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if ($user->role !== 'sekolah') {
            return response()->json(['message' => 'Hanya sekolah yang dapat melihat laporan sekolah.'], 403);
        }

        if (! $user->sekolah_id) {
            return response()->json(['message' => 'Akun sekolah belum terhubung ke data sekolah.'], 422);
        }

        // Get laporan_sekolah and verify it belongs to user's school
        $laporan = DB::table('laporan_sekolah as ls')
            ->where('ls.id', $id)
            ->where('ls.sekolah_id', $user->sekolah_id)
            ->first();

        if (! $laporan) {
            return response()->json(['message' => 'Laporan tidak ditemukan atau Anda tidak memiliki akses.'], 404);
        }

        // Get location data
        $lokasi = DB::table('laporan_lokasi')
            ->where('laporan_sekolah_id', $id)
            ->first();

        // Get files
        $files = DB::table('file_path')
            ->where('laporan_sekolah_id', $id)
            ->get()
            ->mapWithKeys(function ($file) {
                return [
                    $file->jenis => '/storage/' . $file->file,
                ];
            });
        $fileMap = $files->all();

        $createdAt = Carbon::parse($laporan->created_at);
        $tanggal = $createdAt->translatedFormat('j F Y'); // "3 Mei 2026"
        $waktuUpload = $createdAt->format('H.i'); // "09.17"

        return response()->json([
            'data' => [
                'laporan' => (array) $laporan,
                'waktuLaporan' => [
                    'tanggal' => Carbon::parse($laporan->tanggal)->translatedFormat('j F Y'),
                    'tanggalNormal' => $laporan->tanggal,
                    'waktuUpload' => $waktuUpload,
                    'waktuPerangkat' => $waktuUpload,
                ],
                'lokasiUpload' => [
                    'koordinat' => $lokasi ? "{$lokasi->latitude}, {$lokasi->longitude}" : '-',
                    'akurasi' => $lokasi ? "±{$lokasi->akurasi}m" : '-',
                    'lokasi' => $lokasi->alamat ?? '-',
                ],
                'fotoLaporan' => [
                    'menu' => $fileMap['menu'] ?? null,
                    'siswa' => $fileMap['siswa_makan'] ?? null,
                ],
                'meta' => [
                    'jumlahPenerima' => $laporan->jumlah_penerima,
                    'jumlahDikonsumsi' => $laporan->jumlah_dikonsumsi,
                    'sisa' => $laporan->sisa,
                    'keterangan' => $laporan->keterangan,
                    'laporan' => "{$laporan->id} dari ? Laporan",
                ],
            ],
        ]);
    }

    /**
     * Get detail laporan distribusi with SPPG, school and menu information.
     */
    public function showDistribution(Request $request, int $id): JsonResponse
    {
        $user = $this->resolveUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if ($user->role !== 'sppg') {
            return response()->json(['message' => 'Hanya SPPG yang dapat melihat laporan distribusi.'], 403);
        }

        if (! $user->sppg_id) {
            return response()->json(['message' => 'Akun SPPG belum terhubung ke data SPPG.'], 422);
        }

        // Get laporan_sppg and verify it belongs to user's SPPG
        $laporan = DB::table('laporan_sppg as ls')
            ->where('ls.id', $id)
            ->where('ls.sppg_id', $user->sppg_id)
            ->first();

        if (! $laporan) {
            return response()->json(['message' => 'Laporan distribusi tidak ditemukan atau Anda tidak memiliki akses.'], 404);
        }

        // Get SPPG details
        $sppg = DB::table('sppg as s')
            ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
            ->leftJoin('jenis_dapur as jd', 'jd.id', '=', 's.jenis_dapur_id')
            ->where('s.id', $user->sppg_id)
            ->first([
                's.id',
                's.nama_sppg',
                's.kode_sppg',
                's.alamat',
                's.desa_kelurahan',
                's.kapasitas_harian',
                's.status_operasional',
                's.no_telepon_pengelola',
                's.email_pengelola',
                'k.nama_kecamatan',
                'jd.nama as jenis_dapur',
            ]);

        // Get school receiving the distribution
        $sekolah = DB::table('sekolah as s')
            ->leftJoin('kecamatan as k', 'k.id', '=', 's.kecamatan_id')
            ->where('s.id', $laporan->sekolah_id)
            ->first([
                's.id',
                's.nama_sekolah',
                's.jenis_sekolah',
                's.alamat',
                's.desa_kelurahan',
                's.total_siswa',
                's.no_telepon',
                's.email',
                'k.nama_kecamatan',
            ]);

        // Get menu items
        $menu = DB::table('menu')
            ->where('distribusi_id', $id)
            ->get();

        // Get distributor info
        $distributor = DB::table('users')
            ->where('id', $laporan->distributed_by)
            ->first(['id', 'kode', 'name', 'email']);

        return response()->json([
            'data' => [
                'laporan' => (array) $laporan,
                'sppg' => $sppg,
                'sekolah' => $sekolah,
                'menu' => $menu,
                'meta' => [
                    'distributedBy' => $distributor?->name ?? '-',
                    'distributorKode' => $distributor?->kode ?? '-',
                    'createdAt' => $laporan->tanggal ?? now(),
                ],
                'fotoMenuUrl' => $laporan->foto_menu ? '/storage/' . $laporan->foto_menu : null,
            ],
        ]);
    }

    private function roleScope(?string $role): array
    {
        return match ($role) {
            'superadmin' => [
                'title' => 'Panel Superadmin',
                'description' => 'Ringkasan seluruh modul program dan akses penuh data.',
            ],
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
