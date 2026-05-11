<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LaporanSekolah extends Model
{
    protected $table = 'laporan_sekolah';

    public $timestamps = false;

    protected $fillable = [
        'sekolah_id',
        'tanggal',
        'jumlah_penerima',
        'jumlah_dikonsumsi',
        'sisa',
        'keterangan',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'tanggal' => 'date',
    ];

    /**
     * Get the school associated with this report.
     */
    public function sekolah(): BelongsTo
    {
        return $this->belongsTo(Sekolah::class, 'sekolah_id');
    }

    /**
     * Get location data for this report.
     */
    public function lokasi(): HasMany
    {
        return $this->hasMany(LaporanLokasi::class, 'laporan_sekolah_id');
    }

    /**
     * Get files for this report.
     */
    public function filePath(): HasMany
    {
        return $this->hasMany(FilePath::class, 'laporan_sekolah_id');
    }
}
