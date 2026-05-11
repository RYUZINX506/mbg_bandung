<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sppg extends Model
{
    protected $table = 'sppg';

    public $timestamps = false;

    protected $fillable = [
        'nama_sppg',
        'kode_sppg',
        'kecamatan_id',
        'alamat',
        'desa_kelurahan',
        'nama_pengelola',
        'no_telepon_pengelola',
        'email_pengelola',
        'kapasitas_harian',
        'fasilitas_dapur',
        'status_operasional',
        'latitude',
        'longitude',
        'mulai_operasional',
        'jumlah_staf',
        'catatan',
        'bahanbaku_id',
        'ahli_gizi_id',
        'jenis_dapur_id',
        'sertifikat',
    ];

    /**
     * Get the nutritionist (ahli gizi) associated with this SPPG.
     */
    public function ahliGizi(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ahli_gizi_id');
    }

    /**
     * Get all users (operators) associated with this SPPG.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'sppg_id');
    }

    /**
     * Get all reports for this SPPG.
     */
    public function laporanSppg(): HasMany
    {
        return $this->hasMany(LaporanSppg::class, 'sppg_id');
    }

    /**
     * Get schools served by this SPPG.
     */
    public function sekolahServed(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Sekolah::class, 'laporan_sppg', 'sppg_id', 'sekolah_id');
    }
}
