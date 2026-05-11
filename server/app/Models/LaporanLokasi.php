<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LaporanLokasi extends Model
{
    protected $table = 'laporan_lokasi';

    public $timestamps = false;

    protected $fillable = [
        'laporan_sekolah_id',
        'latitude',
        'longitude',
        'akurasi',
        'alamat',
    ];

    /**
     * Get the school report associated with this location.
     */
    public function laporanSekolah(): BelongsTo
    {
        return $this->belongsTo(LaporanSekolah::class, 'laporan_sekolah_id');
    }
}
