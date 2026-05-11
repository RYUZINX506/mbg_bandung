# Report Detail Endpoints - Laporan Sekolah & Distribusi SPPG

## Deskripsi Fitur

Ketika sekolah atau SPPG upload laporan/distribusi, sistem akan:
1. Otomatis mengaitkan laporan dengan ID pengguna yang upload
2. Menampilkan detail laporan dengan data sekolah atau SPPG terkait
3. Memastikan user hanya bisa melihat laporan mereka sendiri

## API Endpoints

### 1. Detail Laporan Sekolah

**Endpoint:** `GET /api/panel/report/{id}`

**Authorization:** Hanya user dengan role `sekolah` yang bisa akses laporan milik mereka

**Parameter:**
- `{id}` - ID laporan_sekolah

**Contoh Request:**
```bash
curl -X GET http://localhost:8000/api/panel/report/1 \
  -H "Authorization: Bearer {token}"
```

**Response (200):**
```json
{
  "data": {
    "laporan": {
      "id": 1,
      "sekolah_id": 1,
      "tanggal": "2026-05-03",
      "jumlah_penerima": 245,
      "jumlah_dikonsumsi": 240,
      "sisa": 5,
      "keterangan": "Laporan hari ini.",
      "created_at": "2026-05-03 10:30:00"
    },
    "sekolah": {
      "id": 1,
      "nama_sekolah": "SD Negeri Cibiru 03",
      "jenis_sekolah": "SD",
      "alamat": "Jl. Pendidikan No. 3, Cibiru",
      "desa_kelurahan": "Cibiru",
      "total_siswa": 245,
      "no_telepon": "0227000003",
      "email": "sdcibiru03@mbg.test",
      "nama_kepala_sekolah": "Ibu Dewi",
      "nama_kecamatan": "Cibiru"
    },
    "lokasi": {
      "id": 1,
      "laporan_sekolah_id": 1,
      "latitude": -6.9231,
      "longitude": 107.6954,
      "akurasi": 12.50,
      "alamat": "Jl. Pendidikan No. 3, Cibiru"
    },
    "files": {
      "menu": {
        "file": "reports/school/menu/xyz.jpg",
        "url": "/storage/reports/school/menu/xyz.jpg",
        "created_at": "2026-05-03 10:30:00"
      },
      "siswa_makan": {
        "file": "reports/school/student/abc.jpg",
        "url": "/storage/reports/school/student/abc.jpg",
        "created_at": "2026-05-03 10:30:00"
      }
    },
    "meta": {
      "uploadedBy": "Operator Sekolah",
      "uploadedAt": "2026-05-03 10:30:00"
    }
  }
}
```

**Error Responses:**
- `401` - User tidak authorized
- `403` - User bukan role sekolah
- `404` - Laporan tidak ditemukan atau user tidak punya akses
- `422` - Akun sekolah belum terhubung ke data sekolah

---

### 2. Detail Laporan Distribusi SPPG

**Endpoint:** `GET /api/panel/distribution/{id}`

**Authorization:** Hanya user dengan role `sppg` yang bisa akses distribusi milik mereka

**Parameter:**
- `{id}` - ID laporan_sppg

**Contoh Request:**
```bash
curl -X GET http://localhost:8000/api/panel/distribution/1 \
  -H "Authorization: Bearer {token}"
```

**Response (200):**
```json
{
  "data": {
    "laporan": {
      "id": 1,
      "sppg_id": 1,
      "sekolah_id": 1,
      "bahan_baku_id": null,
      "tanggal": "2026-05-03",
      "porsi_distribusi": 245,
      "kalori": null,
      "protein": null,
      "karbo": null,
      "lemak": null,
      "status_delivery": "Terkirim",
      "status_terkirim": "OK",
      "distributed_by": 4
    },
    "sppg": {
      "id": 1,
      "nama_sppg": "SPPG Sukasari Utama",
      "kode_sppg": "SPPG-001",
      "alamat": "Jl. Melati No. 1, Sukasari",
      "desa_kelurahan": "Sukasari",
      "kapasitas_harian": 1000,
      "status_operasional": "Aktif",
      "no_telepon_pengelola": "081200000010",
      "email_pengelola": "sppg1@mbg.test",
      "nama_kecamatan": "Sukasari",
      "jenis_dapur": "Dapur Satelit Modular"
    },
    "sekolah": {
      "id": 1,
      "nama_sekolah": "SD Negeri Cibiru 03",
      "jenis_sekolah": "SD",
      "alamat": "Jl. Pendidikan No. 3, Cibiru",
      "desa_kelurahan": "Cibiru",
      "total_siswa": 245,
      "no_telepon": "0227000003",
      "email": "sdcibiru03@mbg.test",
      "nama_kecamatan": "Cibiru"
    },
    "menu": [
      {
        "id": 1,
        "distribusi_id": 1,
        "code": null,
        "deskripsi": "Nasi Kuning, Ayam Goreng, Sayur Asem",
        "kategori": "Sehat",
        "kalori": null,
        "protein": null,
        "karbohidrat": null,
        "lemak": null,
        "jumlah": null
      }
    ],
    "meta": {
      "distributedBy": "Operator SPPG",
      "distributorKode": "SPPG-001",
      "createdAt": "2026-05-03"
    }
  }
}
```

**Error Responses:**
- `401` - User tidak authorized
- `403` - User bukan role sppg
- `404` - Laporan tidak ditemukan atau user tidak punya akses
- `422` - Akun SPPG belum terhubung ke data SPPG

---

## Fitur Keamanan

### Authorization Check
- Setiap endpoint memeriksa user token terlebih dahulu
- User yang tidak logged in akan mendapat response `401 Unauthorized`

### Role-Based Access
- Laporan sekolah hanya bisa diakses oleh user dengan role `sekolah`
- Laporan distribusi hanya bisa diakses oleh user dengan role `sppg`

### Data Ownership Verification
- Laporan sekolah hanya ditampilkan jika `sekolah_id` pada laporan = `sekolah_id` dari user
- Laporan distribusi hanya ditampilkan jika `sppg_id` pada laporan = `sppg_id` dari user
- Jika tidak sesuai, akan return `404 Not Found`

### Integration Validation
- Sistem memverifikasi bahwa user properly linked ke entitasnya
- Jika `sekolah_id` atau `sppg_id` kosong, akan return `422 Unprocessable Entity`

---

## Data Flow Diagram

### Sekolah Upload Laporan:
```
User (SEK-001, role=sekolah, sekolah_id=1)
  ↓
POST /api/panel/report
  ↓
storeSchoolReport() menggunakan user.sekolah_id
  ↓
Insert into laporan_sekolah (sekolah_id = 1)
  ↓
GET /api/panel/report/1
  ↓
showSchoolReport() verify sekolah_id==1
  ↓
Return detail dengan sekolah info + files
```

### SPPG Upload Distribusi:
```
User (SPPG-001, role=sppg, sppg_id=1)
  ↓
POST /api/panel/distribution
  ↓
storeDistribution() menggunakan user.sppg_id
  ↓
Insert into laporan_sppg (sppg_id = 1, distributed_by = user.id)
  ↓
GET /api/panel/distribution/1
  ↓
showDistribution() verify sppg_id==1
  ↓
Return detail dengan sppg info + sekolah tujuan + menu
```

---

## Testing dengan Demo Data

### Lihat Laporan Sekolah:
```bash
# Token untuk SEK-001 (sekolah_id=1)
curl -X GET http://localhost:8000/api/panel/report/1 \
  -H "Authorization: Bearer {SEK-001_TOKEN}"
```

### Lihat Distribusi SPPG:
```bash
# Token untuk SPPG-001 (sppg_id=1)
curl -X GET http://localhost:8000/api/panel/distribution/1 \
  -H "Authorization: Bearer {SPPG-001_TOKEN}"
```

### Coba Akses Unauthorized:
```bash
# SEK-001 mencoba akses laporan yang bukan miliknya (akan 404)
curl -X GET http://localhost:8000/api/panel/report/999 \
  -H "Authorization: Bearer {SEK-001_TOKEN}"

# SEK-001 mencoba akses distribusi SPPG (akan 403)
curl -X GET http://localhost:8000/api/panel/distribution/1 \
  -H "Authorization: Bearer {SEK-001_TOKEN}"
```

---

## Summary

✅ **Upload Laporan/Distribusi** - Otomatis menggunakan user ID dari token
✅ **View Detail** - Hanya user pemilik yang bisa akses
✅ **Sekolah Details** - Otomatis ditampilkan dari laporan sekolah
✅ **SPPG Details** - Otomatis ditampilkan dari laporan distribusi
✅ **Files & Menu** - Semua file dan menu otomatis diambil dan ditampilkan
✅ **Metadata** - Info siapa yang upload dan kapan selalu tersedia
