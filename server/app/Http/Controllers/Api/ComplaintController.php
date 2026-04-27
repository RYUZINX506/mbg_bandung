<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ComplaintController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'role' => ['required', 'in:Individu,Pihak Sekolah,SPPG,individu,sekolah,sppg'],
            'target' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'message' => ['required', 'string'],
        ]);

        $role = match ($validated['role']) {
            'Individu', 'individu' => 'individu',
            'Pihak Sekolah', 'sekolah' => 'sekolah',
            default => 'sppg',
        };

        $id = DB::table('pengaduan')->insertGetId([
            'nama' => $validated['name'],
            'jenis_pelapor' => $role,
            'pesan' => $validated['message'],
            'tanggal_kirim' => now()->toDateString(),
            'status' => $validated['category'] ?? 'baru',
            'no_telepon' => $validated['phone'] ?? null,
            'tujuan' => $validated['target'] ?? null,
            'sekolah' => null,
        ]);

        return response()->json([
            'message' => 'Pengaduan berhasil dikirim.',
            'data' => [
                'id' => $id,
            ],
        ], 201);
    }
}
