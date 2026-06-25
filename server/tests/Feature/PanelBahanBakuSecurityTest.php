<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PanelBahanBakuSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_duplicate_bahan_baku_names_are_rejected(): void
    {
        $token = 'demo-token';

        DB::table('users')->insert([
            'kode' => 'SPPG-TEST',
            'name' => 'SPPG Tester',
            'email' => 'sppg@test.com',
            'password' => Hash::make('secret123'),
            'role' => 'sppg',
            'api_token' => hash('sha256', $token),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/panel/bahanbaku', [
                'nama' => 'Beras Premium',
                'kategori' => 'Karbohidrat',
                'ketersediaan' => 'Tersedia',
            ])
            ->assertStatus(201);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/panel/bahanbaku', [
                'nama' => 'Beras Premium',
                'kategori' => 'Karbohidrat',
                'ketersediaan' => 'Tersedia',
            ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Bahan baku dengan nama yang sama sudah ada.');
    }
}
