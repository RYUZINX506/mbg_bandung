<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FilePath extends Model
{
    protected $table = 'file_path';

    public $timestamps = false;

    protected $fillable = [
        'laporan_sekolah_id',
        'jenis',
        'file',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get the school report associated with this file.
     */
    public function laporanSekolah(): BelongsTo
    {
        return $this->belongsTo(LaporanSekolah::class, 'laporan_sekolah_id');
    }
}
