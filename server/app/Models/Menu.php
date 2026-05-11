<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Menu extends Model
{
    protected $table = 'menu';

    public $timestamps = false;

    protected $fillable = [
        'sppg_id',
        'nama_menu',
        'distribusi_id',
        'code',
        'deskripsi',
        'kategori',
        'kalori',
        'protein',
        'karbohidrat',
        'lemak',
        'jumlah',
    ];

    /**
     * Get the SPPG that owns this menu template.
     */
    public function sppg(): BelongsTo
    {
        return $this->belongsTo(Sppg::class);
    }

    /**
     * Get the SPPG distribution associated with this menu.
     */
    public function laporanSppg(): BelongsTo
    {
        return $this->belongsTo(LaporanSppg::class, 'distribusi_id');
    }
}

