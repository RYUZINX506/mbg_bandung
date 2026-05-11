# List & Detail Laporan Endpoints

## Overview
Fitur untuk menampilkan list laporan sekolah dan distribusi SPPG dengan detail breakdown, mirip seperti struktur UI pada screenshot.

Flow:
1. User lihat **LIST** laporan (grouped by tanggal)
2. Klik salah satu laporan → Buka **DETAIL** laporan dengan full information

---

## 📋 Laporan Sekolah

### 1. List Laporan Sekolah

**Endpoint:** `GET /api/panel/reports`

**Authorization:** Role `sekolah`

**Query Parameters:**
- `per_page` - Jumlah item per halaman (default: 10, max: 50)

**Response (200):**
```json
{
  "data": {
    "sekolah": {
      "id": 1,
      "nama_sekolah": "SD Negeri Cibiru 03",
      "jenis_sekolah": "SD",
      "alamat": "Jl. Pendidikan No. 3, Cibiru",
      "total_siswa": 245,
      "no_telepon": "0227000003"
    },
    "reports": [
      {
        "id": 1,
        "tanggal": "2026-05-03",
        "jumlah_penerima": 245,
        "jumlah_dikonsumsi": 240,
        "sisa": 5,
        "keterangan": "Laporan hari ini.",
        "created_at": "2026-05-03 10:30:00",
        "files": {
          "menu": {
            "file": "reports/school/menu/abc123.jpg",
            "url": "/storage/reports/school/menu/abc123.jpg"
          },
          "siswa_makan": {
            "file": "reports/school/student/def456.jpg",
            "url": "/storage/reports/school/student/def456.jpg"
          }
        }
      },
      {
        "id": 2,
        "tanggal": "2026-05-02",
        "jumlah_penerima": 245,
        "jumlah_dikonsumsi": 243,
        "sisa": 2,
        "keterangan": "Laporan demo sekolah.",
        "created_at": "2026-05-02 15:45:00",
        "files": {
          "menu": {
            "file": "reports/school/menu/xyz789.jpg",
            "url": "/storage/reports/school/menu/xyz789.jpg"
          },
          "siswa_makan": {
            "file": "reports/school/student/uvw321.jpg",
            "url": "/storage/reports/school/student/uvw321.jpg"
          }
        }
      }
    ],
    "grouped": {
      "2026-05-03": [
        {
          "id": 1,
          "tanggal": "2026-05-03",
          "jumlah_penerima": 245,
          "jumlah_dikonsumsi": 240,
          "sisa": 5,
          "keterangan": "Laporan hari ini.",
          "created_at": "2026-05-03 10:30:00",
          "files": { ... }
        }
      ],
      "2026-05-02": [
        {
          "id": 2,
          "tanggal": "2026-05-02",
          "jumlah_penerima": 245,
          "jumlah_dikonsumsi": 243,
          "sisa": 2,
          "keterangan": "Laporan demo sekolah.",
          "created_at": "2026-05-02 15:45:00",
          "files": { ... }
        }
      ]
    }
  },
  "meta": {
    "currentPage": 1,
    "lastPage": 1,
    "perPage": 10,
    "total": 2
  }
}
```

**Usage (Frontend):**
```javascript
// Get list laporan
fetch('/api/panel/reports?per_page=10', {
  headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => r.json())
.then(res => {
  // Group by tanggal untuk display
  // res.data.grouped sudah terstruktur by tanggal
  Object.entries(res.data.grouped).forEach(([tanggal, laporan]) => {
    console.log(`Laporan ${tanggal}:`);
    laporan.forEach(lap => {
      console.log(` - ${lap.jumlah_penerima} siswa penerima`);
      console.log(` - Foto menu: ${lap.files.menu?.url}`);
    });
  });
});
```

---

### 2. Detail Laporan Sekolah

**Endpoint:** `GET /api/panel/report/{id}`

**Authorization:** Role `sekolah` (hanya bisa lihat laporan sendiri)

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
        "file": "reports/school/menu/abc123.jpg",
        "url": "/storage/reports/school/menu/abc123.jpg",
        "created_at": "2026-05-03 10:30:00"
      },
      "siswa_makan": {
        "file": "reports/school/student/def456.jpg",
        "url": "/storage/reports/school/student/def456.jpg",
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

---

## 📦 Distribusi SPPG

### 1. List Distribusi SPPG

**Endpoint:** `GET /api/panel/distributions`

**Authorization:** Role `sppg`

**Query Parameters:**
- `per_page` - Jumlah item per halaman (default: 10, max: 50)

**Response (200):**
```json
{
  "data": {
    "sppg": {
      "id": 1,
      "nama_sppg": "SPPG Sukasari Utama",
      "kode_sppg": "SPPG-001",
      "alamat": "Jl. Melati No. 1, Sukasari",
      "kapasitas_harian": 1000,
      "status_operasional": "Aktif"
    },
    "distributions": [
      {
        "id": 1,
        "tanggal": "2026-05-03",
        "porsi_distribusi": 245,
        "kalori": null,
        "protein": null,
        "karbo": null,
        "lemak": null,
        "status_delivery": "Terkirim",
        "status_terkirim": "OK",
        "created_at": "2026-05-03 08:00:00",
        "sekolah": {
          "id": 1,
          "nama_sekolah": "SD Negeri Cibiru 03",
          "jenis_sekolah": "SD",
          "alamat": "Jl. Pendidikan No. 3, Cibiru"
        },
        "distributor": {
          "name": "Operator SPPG",
          "kode": "SPPG-001"
        },
        "menu": [
          {
            "id": 1,
            "distribusi_id": 1,
            "deskripsi": "Nasi Kuning, Ayam Goreng, Sayur Asem",
            "kategori": "Sehat",
            "kalori": null,
            "protein": null,
            "karbohidrat": null,
            "lemak": null
          }
        ]
      },
      {
        "id": 2,
        "tanggal": "2026-05-02",
        "porsi_distribusi": 240,
        "kalori": null,
        "protein": null,
        "karbo": null,
        "lemak": null,
        "status_delivery": "Terkirim",
        "status_terkirim": "OK",
        "created_at": "2026-05-02 08:30:00",
        "sekolah": {
          "id": 2,
          "nama_sekolah": "SMP Negeri Bandung Wetan 1",
          "jenis_sekolah": "SMP",
          "alamat": "Jl. Diponegoro No. 1, Bandung Wetan"
        },
        "distributor": {
          "name": "Operator SPPG",
          "kode": "SPPG-001"
        },
        "menu": [ ... ]
      }
    ],
    "grouped": {
      "2026-05-03": [
        { ... }
      ],
      "2026-05-02": [
        { ... }
      ]
    }
  },
  "meta": {
    "currentPage": 1,
    "lastPage": 1,
    "perPage": 10,
    "total": 2
  }
}
```

---

### 2. Detail Distribusi SPPG

**Endpoint:** `GET /api/panel/distribution/{id}`

**Authorization:** Role `sppg` (hanya bisa lihat distribusi sendiri)

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

---

## 📱 Frontend Implementation Example

### Display List (Laporan Sekolah)

```jsx
function LaporanSekolahList() {
  const [laporan, setLaporan] = useState([]);
  
  useEffect(() => {
    fetch('/api/panel/reports?per_page=10', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
    .then(r => r.json())
    .then(res => setLaporan(res.data.grouped));
  }, []);

  return (
    <div>
      {Object.entries(laporan).map(([tanggal, items]) => (
        <div key={tanggal} className="mb-4">
          <h3>Laporan {tanggal}</h3>
          {items.map(lap => (
            <div key={lap.id} className="card">
              <div className="row">
                <div className="col-md-6">
                  <h5>Waktu Laporan</h5>
                  <p>Penerima: {lap.jumlah_penerima}</p>
                  <p>Dikonsumsi: {lap.jumlah_dikonsumsi}</p>
                  <p>Sisa: {lap.sisa}</p>
                </div>
                <div className="col-md-6">
                  <h5>Lapor Upload</h5>
                  <p>Upload at: {lap.created_at}</p>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-md-6">
                  <h6>Foto Menu</h6>
                  {lap.files.menu && (
                    <img src={lap.files.menu.url} alt="Menu" className="img-fluid" />
                  )}
                </div>
                <div className="col-md-6">
                  <h6>Foto Siswa Makan</h6>
                  {lap.files.siswa_makan && (
                    <img src={lap.files.siswa_makan.url} alt="Siswa" className="img-fluid" />
                  )}
                </div>
              </div>
              <button onClick={() => goToDetail(lap.id)}>Lihat Detail</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Display Detail (Laporan Sekolah)

```jsx
function LaporanSekolahDetail({ id }) {
  const [detail, setDetail] = useState(null);
  
  useEffect(() => {
    fetch(`/api/panel/report/${id}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
    .then(r => r.json())
    .then(res => setDetail(res.data));
  }, [id]);

  if (!detail) return <div>Loading...</div>;

  return (
    <div>
      <h2>{detail.sekolah.nama_sekolah}</h2>
      <p>Jenis: {detail.sekolah.jenis_sekolah}</p>
      <p>Alamat: {detail.sekolah.alamat}</p>
      
      <hr />
      
      <h4>Detail Laporan</h4>
      <p>Tanggal: {detail.laporan.tanggal}</p>
      <p>Penerima: {detail.laporan.jumlah_penerima}</p>
      <p>Dikonsumsi: {detail.laporan.jumlah_dikonsumsi}</p>
      <p>Sisa: {detail.laporan.sisa}</p>
      
      <hr />
      
      <h4>File Laporan</h4>
      {detail.files.menu && (
        <div>
          <h5>Foto Menu</h5>
          <img src={detail.files.menu.url} alt="Menu" />
        </div>
      )}
      {detail.files.siswa_makan && (
        <div>
          <h5>Foto Siswa Makan</h5>
          <img src={detail.files.siswa_makan.url} alt="Siswa" />
        </div>
      )}
    </div>
  );
}
```

---

## Summary

✅ **List Laporan** - Sekolah bisa lihat semua laporan mereka (grouped by tanggal)
✅ **Detail Laporan** - Klik laporan untuk lihat full detail + file + sekolah info
✅ **Authorization** - Hanya bisa lihat laporan/distribusi milik sendiri
✅ **File Preview** - URL foto tersedia untuk preview di frontend
✅ **Grouped Display** - Data sudah terstruktur by tanggal untuk mudah di-display
