<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'kode',
        'name',
        'email',
        'role',
        'api_token',
        'password',
        'sekolah_id',
        'sppg_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'api_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the school associated with this user.
     */
    public function sekolah(): BelongsTo
    {
        return $this->belongsTo(Sekolah::class, 'sekolah_id');
    }

    /**
     * Get the SPPG associated with this user.
     */
    public function sppg(): BelongsTo
    {
        return $this->belongsTo(Sppg::class, 'sppg_id');
    }

    /**
     * Get the entity (sekolah or sppg) associated with this user's role.
     */
    public function getAssociatedEntity()
    {
        return match ($this->role) {
            'sekolah' => $this->sekolah,
            'sppg', 'ahli_gizi' => $this->sppg,
            default => null,
        };
    }

    /**
     * Check if user is properly linked to their role entity.
     */
    public function isProperlyLinked(): bool
    {
        return match ($this->role) {
            'sekolah' => $this->sekolah_id !== null,
            'sppg', 'ahli_gizi' => $this->sppg_id !== null,
            'admin', 'superadmin' => true,
            default => false,
        };
    }
}
