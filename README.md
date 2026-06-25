# MBG Bandung

Panduan ini dibuat untuk orang yang baru pertama kali menjalankan project ini di lokal.

## Ringkasan Project

Project ini terdiri dari 2 aplikasi:

- `server/` = Backend Laravel (API + database)
- `client/` = Frontend React + Vite

Frontend memanggil API melalui path `/api`, lalu diteruskan ke Laravel di `http://127.0.0.1:8000` lewat proxy Vite.

## Prasyarat

Pastikan sudah terinstall:

- Git
- PHP 8.2+
- Composer 2+
- Node.js 20+ dan npm
- MySQL 8+

## Struktur Utama

```text
mbg_bandung/
  client/   -> React + Vite + TypeScript
  server/   -> Laravel 12
```

## Setup Cepat (Windows / PowerShell)

### 1. Clone repo

```powershell
git clone <URL_REPO_KAMU>
cd mbg_bandung
```

### 2. Setup backend Laravel

```powershell
cd server
composer install
cp .env.example .env
php artisan key:generate
```

Default `.env.example` sudah siap dipakai. Jadi setelah `cp`, bisa langsung lanjut.

Kalau ingin pakai konfigurasi database sendiri, ubah `.env` seperti ini:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=backand
DB_USERNAME=root
DB_PASSWORD=
```

Buat database jika belum ada:

```sql
CREATE DATABASE backand;
```

Lanjut migrasi + seed data presentasi:

```powershell
php artisan migrate:fresh --seed
php artisan serve
```

Backend berjalan di:

- `http://127.0.0.1:8000`

### 3. Setup frontend React

Buka terminal baru:

```powershell
cd client
npm install
npm run dev
```

Frontend berjalan di:

- `http://localhost:5173`

## Akun Demo Login

Semua akun demo memakai password yang sama:

- Password: `password`

Contoh akun:

- `superadmin@mbg.test` (superadmin)
- `admin@mbg.test` (admin)
- `gizi.pres@mbg.test` (ahli_gizi)
- `operator.sppg.pres@mbg.test` (sppg)
- `operator.sekolah.pres@mbg.test` (sekolah)

Sumber data akun: `server/database/seeders/PresentationSeeder.php`.

Kalau ingin kembali ke data demo lama, set `SEED_PRESET=demo` sebelum menjalankan `php artisan migrate:fresh --seed`.

## Menjalankan Keduanya Sekaligus

Opsi paling simpel: jalankan 2 terminal terpisah.

- Terminal 1: `cd server` lalu `php artisan serve`
- Terminal 2: `cd client` lalu `npm run dev`

## Command Penting

Backend (`server/`):

```powershell
php artisan migrate
php artisan migrate:fresh --seed
php artisan test
```

Frontend (`client/`):

```powershell
npm run dev
npm run build
npm run lint
```

## Troubleshooting Singkat

1. Error CORS atau API tidak terpanggil:
   - Pastikan Laravel berjalan di `127.0.0.1:8000`.
   - Pastikan frontend dijalankan dari Vite (`npm run dev`) karena ada proxy `/api`.

2. Login gagal padahal akun benar:
   - Jalankan ulang `php artisan migrate:fresh --seed`.
   - Pastikan password memang `password`.

3. Database error:
   - Cek nama DB di `.env` adalah `backand`.
   - Pastikan MySQL aktif.

## Push Semua Perubahan ke Repo Baru

Setelah semua perubahan siap, dari root project jalankan:

```powershell
git add .
git commit -m "docs: tambah README onboarding untuk first run"
git branch -M main
git remote remove origin
git remote add origin <URL_REPO_BARU>
git push -u origin main
```

Kalau repo lama masih ingin dipertahankan, jangan `remove origin`. Gunakan remote baru dengan nama lain:

```powershell
git remote add new-origin <URL_REPO_BARU>
git push -u new-origin main
```

## Dokumentasi Tambahan

- `client/README.md`
- `client/PAGES.md`
- `server/DATABASE_INTEGRATION.md`
- `server/LIST_AND_DETAIL_ENDPOINTS.md`
- `server/REPORT_DETAIL_ENDPOINTS.md`
