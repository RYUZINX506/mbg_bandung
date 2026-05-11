# Database Integration - Akun, Sekolah, dan SPPG

## Ringkasan Integrasi
Sistem database telah diintegrasikan untuk memastikan akun pengguna terhubung dengan entitas yang sesuai berdasarkan role mereka:

### Aturan Integrasi Role

| Role | Persyaratan | Deskripsi |
|------|------------|-----------|
| `sekolah` | Harus memiliki `sekolah_id` | Operator sekolah terhubung ke satu data sekolah |
| `sppg` | Harus memiliki `sppg_id` | Operator SPPG terhubung ke satu data SPPG |
| `ahli_gizi` | Harus memiliki `sppg_id` | Ahli gizi terhubung ke satu data SPPG |
| `admin` | Tidak ada persyaratan | Admin tidak perlu terhubung ke entitas khusus |
| `superadmin` | Tidak ada persyaratan | Superadmin memiliki akses ke semua data |

### Struktur Database

#### User Model Relationships
```php
// User hasOne Sekolah
User::with('sekolah')

// User hasOne Sppg
User::with('sppg')
```

#### Model-Model yang Dibuat
1. **Sekolah** - Mewakili data sekolah dengan relationships:
   - `users()` - Operator sekolah (HasMany)
   - `laporanSekolah()` - Laporan dari sekolah (HasMany)
   - `laporanSppg()` - Distribusi SPPG (HasMany)

2. **Sppg** - Mewakili data SPPG dengan relationships:
   - `ahliGizi()` - Ahli gizi penanggungjawab (BelongsTo User)
   - `users()` - Operator SPPG (HasMany)
   - `laporanSppg()` - Distribusi SPPG (HasMany)
   - `sekolahServed()` - Sekolah yang dilayani (BelongsToMany)

3. **LaporanSekolah** - Laporan dari sekolah
4. **LaporanSppg** - Distribusi/laporan SPPG
5. **LaporanLokasi** - Data lokasi laporan
6. **FilePath** - File laporan
7. **Menu** - Menu distribusi SPPG

### Migration
**File:** `2026_05_03_000008_add_role_based_integration_constraints.php`

Menambahkan:
- Perubahan foreign key menjadi `cascadeOnDelete`
- Check constraints untuk memastikan integritas role-based

### API Endpoints

#### User Management (Admin Only)
```
GET    /api/admin/users              # Daftar users dengan filter
POST   /api/admin/users              # Buat user baru
GET    /api/admin/users/{id}         # Detail user
PUT    /api/admin/users/{id}         # Update user
```

#### Contoh Request Membuat User

**Untuk user dengan role sekolah:**
```json
POST /api/admin/users
{
  "kode": "SEK-003",
  "name": "Operator Sekolah Baru",
  "email": "sekolah3@mbg.test",
  "password": "password123",
  "role": "sekolah",
  "sekolah_id": 1
}
```

**Untuk user dengan role sppg:**
```json
POST /api/admin/users
{
  "kode": "SPPG-004",
  "name": "Operator SPPG Baru",
  "email": "sppg4@mbg.test",
  "password": "password123",
  "role": "sppg",
  "sppg_id": 2
}
```

**Untuk user dengan role ahli_gizi:**
```json
POST /api/admin/users
{
  "kode": "GIZI-002",
  "name": "Ahli Gizi Baru",
  "email": "gizi2@mbg.test",
  "password": "password123",
  "role": "ahli_gizi",
  "sppg_id": 1
}
```

### User Model Methods

#### Checking Role Integration
```php
$user = User::find(1);

// Check jika user properly linked ke entitasnya
$user->isProperlyLinked(); // return boolean

// Get entity yang terhubung dengan user
$entity = $user->getAssociatedEntity(); // return Sekolah|Sppg|null
```

### Validasi
Sistem melakukan validasi otomatis:
1. User dengan role `sekolah` HARUS memiliki `sekolah_id`
2. User dengan role `sppg` atau `ahli_gizi` HARUS memiliki `sppg_id`
3. Check constraints di database memastikan data integrity
4. Relationship sekolah dan sppg menggunakan `cascadeOnDelete`

### Demo Data
Seeder sudah menyediakan demo users yang properly linked:
- `SEK-001` → SD Negeri Cibiru 03
- `SEK-002` → SMP Negeri Bandung Wetan 1
- `SPPG-001` → SPPG Sukasari Utama
- `SPPG-002` → SPPG Bandung Wetan Sentra
- `GIZI-001` → SPPG Coblong Sejahtera
