<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Throwable;

class AdminDataController extends Controller
{
    private const MANAGED_TABLES = [
        'users',
        'kecamatan',
        'status_program',
        'satuan',
        'jenis_dapur',
        'fasilitas_dapur',
        'user_profiles',
        'supplier',
        'bahanbaku',
        'kelompok',
        'sekolah',
        'sppg',
        'laporan_sekolah',
        'laporan_lokasi',
        'file_path',
        'laporan_sppg',
        'menu',
        'pengaduan',
    ];

    public function stats(Request $request): JsonResponse
    {
        $user = $this->resolveAdmin($request);

        if (! $user) {
            return response()->json(['message' => 'Akses admin dibutuhkan.'], 403);
        }

        $counts = collect(self::MANAGED_TABLES)
            ->mapWithKeys(fn (string $table) => [$table => DB::table($table)->count()]);

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'kode' => $user->kode,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'totals' => [
                    'tables' => count(self::MANAGED_TABLES),
                    'records' => (int) $counts->sum(),
                    'users' => (int) ($counts->get('users') ?? 0),
                    'complaints' => (int) ($counts->get('pengaduan') ?? 0),
                ],
                'tableCounts' => $counts,
            ],
        ]);
    }

    public function schema(Request $request): JsonResponse
    {
        if (! $this->resolveAdmin($request)) {
            return response()->json(['message' => 'Akses admin dibutuhkan.'], 403);
        }

        $tables = collect(self::MANAGED_TABLES)
            ->map(fn (string $table) => [
                'name' => $table,
                'label' => Str::of($table)->replace('_', ' ')->title()->toString(),
                'rowCount' => DB::table($table)->count(),
                'primaryKey' => 'id',
                'columns' => $this->readColumnMetadata($table),
            ])
            ->values();

        return response()->json(['data' => $tables]);
    }

    public function rows(Request $request, string $table): JsonResponse
    {
        if (! $this->resolveAdmin($request)) {
            return response()->json(['message' => 'Akses admin dibutuhkan.'], 403);
        }

        if (! $this->isAllowedTable($table)) {
            return response()->json(['message' => 'Tabel tidak diizinkan.'], 404);
        }

        $columns = Schema::getColumnListing($table);
        $columnMeta = collect($this->readColumnMetadata($table));
        $searchableColumns = $columnMeta
            ->filter(fn (array $column) => in_array($column['dataType'], ['varchar', 'char', 'text', 'longtext', 'mediumtext'], true))
            ->pluck('name')
            ->values();

        $search = trim((string) $request->query('search', ''));
        $perPage = max(5, min(50, (int) $request->query('perPage', 10)));

        $query = DB::table($table);

        if ($search !== '' && $searchableColumns->isNotEmpty()) {
            $query->where(function ($builder) use ($searchableColumns, $search): void {
                foreach ($searchableColumns as $column) {
                    $builder->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        if (in_array('id', $columns, true)) {
            $query->orderByDesc('id');
        }

        $pagination = $query->paginate($perPage);

        return response()->json([
            'data' => collect($pagination->items())->map(fn ($row) => (array) $row)->values(),
            'meta' => [
                'currentPage' => $pagination->currentPage(),
                'lastPage' => $pagination->lastPage(),
                'perPage' => $pagination->perPage(),
                'total' => $pagination->total(),
                'columns' => $columns,
            ],
        ]);
    }

    public function store(Request $request, string $table): JsonResponse
    {
        if (! $this->resolveAdmin($request)) {
            return response()->json(['message' => 'Akses admin dibutuhkan.'], 403);
        }

        if (! $this->isAllowedTable($table)) {
            return response()->json(['message' => 'Tabel tidak diizinkan.'], 404);
        }

        $payload = $this->sanitizePayload($table, $request->input('data', []), true);

        if ($payload === []) {
            return response()->json(['message' => 'Tidak ada data valid untuk disimpan.'], 422);
        }

        try {
            $id = DB::table($table)->insertGetId($payload);
        } catch (Throwable $exception) {
            return response()->json(['message' => $this->humanizeDbError($exception->getMessage())], 422);
        }

        $record = DB::table($table)->where('id', $id)->first();

        return response()->json([
            'message' => 'Data berhasil ditambahkan.',
            'data' => $record,
        ], 201);
    }

    public function update(Request $request, string $table, int $id): JsonResponse
    {
        if (! $this->resolveAdmin($request)) {
            return response()->json(['message' => 'Akses admin dibutuhkan.'], 403);
        }

        if (! $this->isAllowedTable($table)) {
            return response()->json(['message' => 'Tabel tidak diizinkan.'], 404);
        }

        $exists = DB::table($table)->where('id', $id)->exists();

        if (! $exists) {
            return response()->json(['message' => 'Data tidak ditemukan.'], 404);
        }

        $payload = $this->sanitizePayload($table, $request->input('data', []), false);

        if ($payload === []) {
            return response()->json(['message' => 'Tidak ada perubahan yang valid.'], 422);
        }

        try {
            DB::table($table)->where('id', $id)->update($payload);
        } catch (Throwable $exception) {
            return response()->json(['message' => $this->humanizeDbError($exception->getMessage())], 422);
        }

        $record = DB::table($table)->where('id', $id)->first();

        return response()->json([
            'message' => 'Data berhasil diperbarui.',
            'data' => $record,
        ]);
    }

    public function destroy(Request $request, string $table, int $id): JsonResponse
    {
        if (! $this->resolveAdmin($request)) {
            return response()->json(['message' => 'Akses admin dibutuhkan.'], 403);
        }

        if (! $this->isAllowedTable($table)) {
            return response()->json(['message' => 'Tabel tidak diizinkan.'], 404);
        }

        $deleted = DB::table($table)->where('id', $id)->delete();

        if (! $deleted) {
            return response()->json(['message' => 'Data tidak ditemukan.'], 404);
        }

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }

    private function resolveAdmin(Request $request)
    {
        $token = $request->bearerToken();

        if (! $token) {
            return null;
        }

        $user = DB::table('users')
            ->where('api_token', hash('sha256', $token))
            ->first([
                'id',
                'kode',
                'name',
                'email',
                'role',
            ]);

        if (! $user || $user->role !== 'admin') {
            return null;
        }

        return $user;
    }

    private function isAllowedTable(string $table): bool
    {
        return in_array($table, self::MANAGED_TABLES, true);
    }

    private function sanitizePayload(string $table, mixed $input, bool $forStore): array
    {
        if (! is_array($input)) {
            return [];
        }

        $columns = collect($this->readColumnMetadata($table));

        $allowedColumns = $columns
            ->reject(function (array $column) use ($forStore): bool {
                if ($column['name'] === 'id') {
                    return true;
                }

                if ($column['extra'] === 'auto_increment') {
                    return true;
                }

                if ($forStore && in_array($column['name'], ['created_at', 'updated_at'], true)) {
                    return true;
                }

                return false;
            })
            ->keyBy('name');

        $payload = [];

        foreach ($input as $column => $value) {
            if (! $allowedColumns->has($column)) {
                continue;
            }

            $dataType = $allowedColumns->get($column)['dataType'];

            if ($value === '') {
                $payload[$column] = null;
                continue;
            }

            if (in_array($dataType, ['int', 'bigint', 'smallint', 'tinyint', 'mediumint'], true)) {
                $payload[$column] = is_null($value) ? null : (int) $value;
                continue;
            }

            if (in_array($dataType, ['decimal', 'float', 'double'], true)) {
                $payload[$column] = is_null($value) ? null : (float) $value;
                continue;
            }

            $payload[$column] = $value;
        }

        return $payload;
    }

    private function readColumnMetadata(string $table): array
    {
        $database = DB::getDatabaseName();

        $columns = DB::select(
            'SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
             FROM information_schema.columns
             WHERE table_schema = ? AND table_name = ?
             ORDER BY ORDINAL_POSITION',
            [$database, $table]
        );

        return collect($columns)
            ->map(function (object $column) {
                return [
                    'name' => $column->COLUMN_NAME,
                    'dataType' => strtolower((string) $column->DATA_TYPE),
                    'columnType' => strtolower((string) $column->COLUMN_TYPE),
                    'nullable' => strtoupper((string) $column->IS_NULLABLE) === 'YES',
                    'default' => $column->COLUMN_DEFAULT,
                    'extra' => strtolower((string) $column->EXTRA),
                    'enumOptions' => $this->parseEnumOptions((string) $column->COLUMN_TYPE),
                ];
            })
            ->values()
            ->all();
    }

    private function parseEnumOptions(string $columnType): array
    {
        if (! Str::startsWith(strtolower($columnType), 'enum(')) {
            return [];
        }

        preg_match_all("/'([^']*)'/", $columnType, $matches);

        return $matches[1] ?? [];
    }

    private function humanizeDbError(string $message): string
    {
        if (Str::contains($message, ['cannot be null', 'Column'])) {
            return 'Ada kolom wajib yang belum diisi.';
        }

        if (Str::contains(strtolower($message), ['duplicate', 'unique'])) {
            return 'Nilai duplikat terdeteksi pada kolom unik.';
        }

        return 'Validasi data gagal. Periksa format kolom yang diinput.';
    }
}
