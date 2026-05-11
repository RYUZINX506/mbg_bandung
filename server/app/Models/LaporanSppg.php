<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LaporanSppg extends Model
{
    protected $table = 'laporan_sppg';

    public $timestamps = false;

    protected $fillable = [
        'sppg_id',
        'sekolah_id',
        'bahan_baku_id',
        'tanggal',
        'porsi_distribusi',
        'kalori',
        'protein',
        'karbo',
        'lemak',
        'status_delivery',
        'status_terkirim',
        'distributed_by',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    /**
     * Get the SPPG associated with this distribution.
     */
    public function sppg(): BelongsTo
    {
        return $this->belongsTo(Sppg::class, 'sppg_id');
    }

    /**
     * Get the school receiving this distribution.
     */
    public function sekolah(): BelongsTo
    {
        return $this->belongsTo(Sekolah::class, 'sekolah_id');
    }

    /**
     * Get the user (distributor) for this distribution.
     */
    public function distributedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'distributed_by');
    }

    /**
     * Get menu items for this distribution.
     */
    public function menu(): HasMany
    {
        return $this->hasMany(Menu::class, 'distribusi_id');
    }
}
