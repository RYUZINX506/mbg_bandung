# Modul & Halaman - Makan Bergizi Gratis (MBG) UI

## 📋 Daftar Halaman/Modul

### 1. **Beranda (Home Page)**
- **Path:** `/`
- **File:** `src/pages/HomePage.tsx`
- **Konten:**
  - Hero section dengan overview program
  - Statistik penerima manfaat
  - Laporan program SPPG dan Sekolah
  - Info SPPG Terpencil
  - Tentang Program

### 2. **Pencarian Sekolah**
- **Path:** `/sekolah`
- **File:** `src/pages/SearchSchoolsPage.tsx`
- **Fitur:**
  - Search by nama sekolah atau kecamatan
  - Filter by tipe sekolah (SD, SMP, SMA)
  - Tampil hasil dalam card grid
  - Info: nama, jumlah siswa, kecamatan, status
  - Button: Lihat Detail, Lihat Menu

### 3. **Pencarian Kelompok (Grup)**
- **Path:** `/kelompok`
- **File:** `src/pages/SearchGroupsPage.tsx`
- **Fitur:**
  - Search by nama kelompok atau kecamatan
  - Filter by kategori (Pesantren, PAUD, Ibu & Balita)
  - Tampil hasil dalam card grid
  - Info: nama, jumlah anggota, kecamatan, kabupaten
  - Button: Lihat Detail, Lihat Laporan

### 4. **Pencarian SPPG**
- **Path:** `/sppg`
- **File:** `src/pages/SearchSPPGPage.tsx`
- **Fitur:**
  - Search by nama SPPG atau kecamatan
  - Filter by kecamatan
  - Identifikasi lokasi terpencil
  - Info: nama, penerima manfaat, lokasi, status
  - Button: Lihat Detail, Lihat Foto

### 5. **Halaman Kontak**
- **Path:** `/kontak`
- **File:** `src/pages/ContactPage.tsx`
- **Fitur:**
  - Form kontak dengan validasi
  - Informasi lokasi kantor
  - Nomor WhatsApp
  - Email
  - Jam operasional
  - Peta lokasi (placeholder)

### 6. **Kebijakan Privasi**
- **Path:** `/privasi`
- **File:** `src/pages/PrivacyPolicyPage.tsx`
- **Konten:**
  1. Pendahuluan
  2. Informasi yang dikumpulkan
  3. Cara penggunaan informasi
  4. Keamanan data
  5. Ruang lingkup
  6. Perubahan kebijakan
  7. Hubungi kami
  8. Perjanjian penggunaan

## 🎨 Struktur Komponen

```
src/
├── pages/
│   ├── HomePage.tsx                    (Halaman beranda)
│   ├── SearchSchoolsPage.tsx           (Halaman cari sekolah)
│   ├── SearchGroupsPage.tsx            (Halaman cari kelompok)
│   ├── SearchSPPGPage.tsx              (Halaman cari SPPG)
│   ├── ContactPage.tsx                 (Halaman kontak)
│   └── PrivacyPolicyPage.tsx           (Halaman privasi)
├── components/
│   ├── Header.tsx                      (Updated dengan React Router)
│   ├── Hero.tsx
│   ├── Statistics.tsx
│   ├── Reports.tsx
│   ├── RemoteSPPG.tsx
│   ├── About.tsx
│   └── Footer.tsx
├── styles/
│   ├── Header.css
│   ├── Hero.css
│   ├── Statistics.css
│   ├── Reports.css
│   ├── RemoteSPPG.css
│   ├── About.css
│   ├── Footer.css
│   ├── SearchPage.css                  (Untuk sekolah, kelompok, SPPG)
│   ├── ContactPage.css
│   └── PolicyPage.css
├── App.tsx                             (Updated dengan routing)
├── App.css
└── main.tsx
```

## 🔗 Routing Setup

`App.tsx` menggunakan React Router untuk SPA navigation:

```tsx
<Router>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/sekolah" element={<SearchSchoolsPage />} />
    <Route path="/kelompok" element={<SearchGroupsPage />} />
    <Route path="/sppg" element={<SearchSPPGPage />} />
    <Route path="/kontak" element={<ContactPage />} />
    <Route path="/privasi" element={<PrivacyPolicyPage />} />
  </Routes>
</Router>
```

## 🎯 Navigasi di Header

Header sudah di-update dengan React Router Link untuk navigasi:
- Beranda: `/`
- Sekolah: `/sekolah`
- Kelompok: `/kelompok`
- SPPG: `/sppg`
- Kontak: `/kontak`
- Privasi: `/privasi`

## 📊 Data Dummy

Setiap halaman search memiliki data dummy untuk demo:
- **SearchSchools:** 6 sekolah dengan tipe SD/SMP/SMA
- **SearchGroups:** 6 kelompok dengan berbagai kategori
- **SearchSPPG:** 6 SPPG termasuk yang terpencil

Untuk production, ganti dengan API calls atau data real dari backend.

## 🌐 Deployment Notes

### Development
```bash
npm run dev
# Jalalan di http://localhost:5173
```

### Production Build
```bash
npm run build
# Hasil di folder `dist/`
```

### Web Server Configuration
Untuk production, pastikan web server di-config redirect all routes ke `index.html`:

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 🎨 Styling

Semua halaman menggunakan tema warna yang konsisten:
- **Primary Color:** `#1e3c72` (Navy Blue)
- **Secondary Color:** `#2a5298` (Light Blue)
- **Accent Color:** Gradients dan status badges

Responsive design:
- Desktop: Full layout
- Tablet: Adjusted grid columns
- Mobile: Single column, hamburger menu

## 📝 Catatan

- Semua halaman menggunakan dummy data untuk demo
- Untuk production, ganti dengan real API integration
- Placeholder images bisa diganti dengan actual images
- Form kontak menampilkan success message (demo)
- Search functionality juga bisa di-enhance dengan real backend

## ✅ Checklist

- [x] Home page dengan statistik
- [x] Search sekolah dengan filter
- [x] Search kelompok dengan filter
- [x] Search SPPG dengan kategori
- [x] Contact form
- [x] Privacy policy
- [x] React Router setup
- [x] Responsive design
- [x] CSS styling untuk semua pages
- [x] Header navigation link updates
- [x] Build test successful
