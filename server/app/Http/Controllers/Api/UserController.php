<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Create a new user with role-based integration.
     *
     * Ensures that users are properly linked to their role entities:
     * - 'sekolah' role must have sekolah_id
     * - 'sppg' or 'ahli_gizi' roles must have sppg_id
     * - 'admin' and 'superadmin' roles don't require linking
     */
    public function store(Request $request): JsonResponse
    {
        $user = $this->resolveAdmin($request);

        if (! $user) {
            return response()->json(['message' => 'Akses admin dibutuhkan.'], 403);
        }

        if ($user->role !== 'superadmin') {
            return response()->json(['message' => 'Akses superadmin dibutuhkan untuk membuat user.'], 403);
        }

        $validated = $request->validate([
            'kode' => ['required', 'string', 'unique:users,kode', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'in:superadmin,admin,sekolah,sppg,ahli_gizi'],
            'sekolah_id' => ['nullable', 'integer', 'exists:sekolah,id'],
            'sppg_id' => ['nullable', 'integer', 'exists:sppg,id'],
        ]);

        // Validate role-based integration
        $validationError = $this->validateRoleIntegration($validated['role'], $validated);

        if ($validationError) {
            return response()->json(['message' => $validationError], 422);
        }

        // Create user with role-based linkage
        $userData = [
            'kode' => $validated['kode'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ];

        // Set appropriate foreign keys based on role
        match ($validated['role']) {
            'sekolah' => $userData['sekolah_id'] = $validated['sekolah_id'],
            'sppg', 'ahli_gizi' => $userData['sppg_id'] = $validated['sppg_id'],
            default => null,
        };

        try {
            $newUser = User::create($userData);

            return response()->json([
                'message' => 'User berhasil dibuat.',
                'data' => [
                    'id' => $newUser->id,
                    'kode' => $newUser->kode,
                    'name' => $newUser->name,
                    'email' => $newUser->email,
                    'role' => $newUser->role,
                    'sekolah_id' => $newUser->sekolah_id,
                    'sppg_id' => $newUser->sppg_id,
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal membuat user: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update user with role-based integration validation.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $this->resolveAdmin($request);

        if (! $user) {
            return response()->json(['message' => 'Akses admin dibutuhkan.'], 403);
        }

        if ($user->role !== 'superadmin') {
            return response()->json(['message' => 'Akses superadmin dibutuhkan untuk mengubah user.'], 403);
        }

        $targetUser = User::find($id);

        if (! $targetUser) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:users,email,' . $id],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['nullable', 'in:superadmin,admin,sekolah,sppg,ahli_gizi'],
            'sekolah_id' => ['nullable', 'integer', 'exists:sekolah,id'],
            'sppg_id' => ['nullable', 'integer', 'exists:sppg,id'],
        ]);

        // Remove null values
        $validated = array_filter($validated, fn ($value) => $value !== null);

        if (empty($validated)) {
            return response()->json(['message' => 'Tidak ada perubahan yang valid.'], 422);
        }

        // If role is being changed, validate integration
        if (isset($validated['role']) && $validated['role'] !== $targetUser->role) {
            $validationError = $this->validateRoleIntegration($validated['role'], $validated);

            if ($validationError) {
                return response()->json(['message' => $validationError], 422);
            }

            // Clear old role linkages
            $validated['sekolah_id'] = null;
            $validated['sppg_id'] = null;

            // Set appropriate foreign keys based on new role
            match ($validated['role']) {
                'sekolah' => $validated['sekolah_id'] = $validated['sekolah_id'] ?? null,
                'sppg', 'ahli_gizi' => $validated['sppg_id'] = $validated['sppg_id'] ?? null,
                default => null,
            };
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        try {
            $targetUser->update($validated);

            return response()->json([
                'message' => 'User berhasil diperbarui.',
                'data' => [
                    'id' => $targetUser->id,
                    'kode' => $targetUser->kode,
                    'name' => $targetUser->name,
                    'email' => $targetUser->email,
                    'role' => $targetUser->role,
                    'sekolah_id' => $targetUser->sekolah_id,
                    'sppg_id' => $targetUser->sppg_id,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal mengubah user: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get all users or filter by role.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->resolveAdmin($request);

        if (! $user) {
            return response()->json(['message' => 'Akses admin dibutuhkan.'], 403);
        }

        $role = $request->query('role');
        $search = $request->query('search', '');

        $query = User::query();

        if ($role) {
            $query->where('role', $role);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('kode', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate(15);

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'currentPage' => $users->currentPage(),
                'lastPage' => $users->lastPage(),
                'perPage' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Get user details with associated entity.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $admin = $this->resolveAdmin($request);

        if (! $admin) {
            return response()->json(['message' => 'Akses admin dibutuhkan.'], 403);
        }

        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        $data = [
            'id' => $user->id,
            'kode' => $user->kode,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'sekolah_id' => $user->sekolah_id,
            'sppg_id' => $user->sppg_id,
            'isProperlyLinked' => $user->isProperlyLinked(),
        ];

        // Include associated entity details
        if ($user->sekolah) {
            $data['sekolah'] = [
                'id' => $user->sekolah->id,
                'nama_sekolah' => $user->sekolah->nama_sekolah,
                'jenis_sekolah' => $user->sekolah->jenis_sekolah,
            ];
        }

        if ($user->sppg) {
            $data['sppg'] = [
                'id' => $user->sppg->id,
                'nama_sppg' => $user->sppg->nama_sppg,
                'kode_sppg' => $user->sppg->kode_sppg,
            ];
        }

        return response()->json(['data' => $data]);
    }

    /**
     * Validate that user role is properly integrated with entity.
     */
    private function validateRoleIntegration(string $role, array $data): ?string
    {
        return match ($role) {
            'sekolah' => ! isset($data['sekolah_id']) || $data['sekolah_id'] === null
                ? 'User dengan role sekolah harus memiliki sekolah_id.'
                : null,
            'sppg', 'ahli_gizi' => ! isset($data['sppg_id']) || $data['sppg_id'] === null
                ? "User dengan role {$role} harus memiliki sppg_id."
                : null,
            default => null,
        };
    }

    /**
     * Resolve admin from token.
     */
    private function resolveAdmin(Request $request): ?object
    {
        $token = $request->bearerToken();

        if (! $token) {
            return null;
        }

        $user = DB::table('users')
            ->where('api_token', hash('sha256', $token))
            ->first(['id', 'kode', 'name', 'email', 'role']);

        if (! $user || ! in_array($user->role, ['admin', 'superadmin'], true)) {
            return null;
        }

        return $user;
    }
}
