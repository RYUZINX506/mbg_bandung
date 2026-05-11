<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sekolah extends Model
{
    protected $table = 'sekolah';

    public $timestamps = false;

    protected $fillable = [
        'nama_sekolah',
        'kecamatan_id',
        'alamat',
        'desa_kelurahan',
        'jenis_sekolah',
        'total_siswa',
        'nama_kepala_sekolah',
        'no_telepon_kepala_sekolah',
        'email',
        'no_telepon',
        'latitude',
        'longitude',
        'status_program_id',
        'tanggal_bergabung',
        'catatan',
    ];

    /**
     * Get all users (operators) associated with this school.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'sekolah_id');
    }

    /**
     * Get all reports for this school.
     */
    public function laporanSekolah(): HasMany
    {
        return $this->hasMany(LaporanSekolah::class, 'sekolah_id');
    }

    /**
     * Get all SPPG distributions to this school.
     */
    public function laporanSppg(): HasMany
    {
        return $this->hasMany(LaporanSppg::class, 'sekolah_id');
    }
}
