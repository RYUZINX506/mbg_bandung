# Makan Bergizi Gratis (MBG) - UI Dashboard

A modern React UI dashboard for the "Makan Bergizi Gratis" (Free Nutritious Meals) program from Kota Bandung.

## 🌟 Fitur Utama

- ✅ **6 Halaman Utama** - Home, Sekolah, Kelompok, SPPG, Kontak, Privasi
- ✅ **React Router** - SPA navigation tanpa reload
- ✅ **Search & Filter** - Pencarian dengan berbagai filter options
- ✅ **Responsive Design** - Mobile-first, bekerja di semua device
- ✅ **Modern UI** - Gradient backgrounds dan smooth animations
- ✅ **TypeScript** - Type-safe development

## 📄 Halaman Utama

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| **Beranda** | `/` | Dashboard utama dengan statistik program MBG |
| **Sekolah** | `/sekolah` | Pencarian dan daftar sekolah penerima manfaat |
| **Kelompok** | `/kelompok` | Pencarian kelompok (Pesantren, PAUD, Ibu & Balita) |
| **SPPG** | `/sppg` | Pencarian lokasi SPPG dengan kategori terpencil |
| **Kontak** | `/kontak` | Form kontak dan informasi lokasi kantor |
| **Privasi** | `/privasi` | Kebijakan privasi lengkap |

## 📁 Struktur Project

```
src/
├── pages/                      # Page components
│   ├── HomePage.tsx            (Dashboard beranda)
│   ├── SearchSchoolsPage.tsx   (Cari sekolah)
│   ├── SearchGroupsPage.tsx    (Cari kelompok)
│   ├── SearchSPPGPage.tsx      (Cari SPPG)
│   ├── ContactPage.tsx         (Form kontak)
│   └── PrivacyPolicyPage.tsx   (Kebijakan privasi)
├── components/
│   ├── Header.tsx              (Navigation with React Router)
│   ├── Hero.tsx
│   ├── Statistics.tsx
│   ├── Reports.tsx
│   ├── RemoteSPPG.tsx
│   ├── About.tsx
│   └── Footer.tsx
├── styles/                     # CSS untuk semua komponen
├── App.tsx                     (Main with routing)
├── App.css
└── main.tsx
```

## 🚀 Getting Started

### Installation

```bash
npm install
npm run dev
```

Buka browser ke `http://localhost:5173/`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎯 Search Pages Features

Setiap halaman search dilengkapi dengan:
- 🔍 Real-time search input
- 🏷️ Multiple filter buttons
- 📊 Result counter
- 🎴 Responsive card grid
- 📱 Mobile-optimized layout

**Dummy Data:**
- Sekolah: 6 items (SD, SMP, SMA)
- Kelompok: 6 items (Pesantren, PAUD, Ibu & Balita)
- SPPG: 6 items (Regular + Terpencil)

## 🎨 Teknologi

- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **CSS3** - Styling with gradients & animations

## 🎨 Design System

```
Primary Color: #1e3c72 (Navy Blue)
Secondary Color: #2a5298 (Light Blue)
Gradients: Multiple combinations
Radius: 6-12px border radius
Shadows: Subtle drop shadows
```

## 📱 Responsive Breakpoints

- **Desktop:** Full layout, multi-column grids
- **Tablet:** 2 columns, optimized spacing
- **Mobile:** Single column, hamburger menu

## 🔧 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## 🌐 Routing Setup

App menggunakan React Router v6 untuk SPA navigation:

```tsx
<Route path="/" element={<HomePage />} />
<Route path="/sekolah" element={<SearchSchoolsPage />} />
<Route path="/kelompok" element={<SearchGroupsPage />} />
<Route path="/sppg" element={<SearchSPPGPage />} />
<Route path="/kontak" element={<ContactPage />} />
<Route path="/privasi" element={<PrivacyPolicyPage />} />
```

## 📝 Customization

### Update Colors
Edit color values di file CSS (main theme: `#1e3c72`, `#2a5298`)

### Replace Images
Add images ke folder `public/` dan update paths di components

### Update Content
Edit files di `src/pages/` untuk:
- Program information
- Search results data
- Contact details
- Policy content

## 🚀 Deployment

### Production Build
```bash
npm run build
# Upload dist/ folder ke web server
```

### Web Server Config (untuk SPA routing)

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

## 📖 Dokumentasi

Lihat [PAGES.md](./PAGES.md) untuk dokumentasi detail tentang setiap halaman.

## ✨ Key Highlights

1. ✨ **Modern Gradient UI** - Professional color scheme
2. 🎯 **Search Functionality** - Multi-filter search di setiap halaman
3. 📊 **Statistics Display** - Progress bars dan visual indicators
4. 📝 **Form Validation** - Contact form dengan error handling
5. ♿ **Accessibility** - Semantic HTML & keyboard navigation
6. ⚡ **Performance** - Fast Vite builds & HMR

## 📦 Dependencies

```json
{
  "react": "^18.x.x",
  "react-dom": "^18.x.x",
  "react-router-dom": "^6.x.x",
  "typescript": "^5.x.x",
  "vite": "^5.x.x"
}
```

## 📝 Notes

- Gunakan data dummy untuk development
- Untuk production, integrate dengan backend API
- Update placeholder images dengan real images
- Customize theme colors sesuai brand guidelines
- Edit form handling untuk production submission

## 🤝 Contributing

Untuk menambah fitur atau perbaikan:
1. Edit halaman di `src/pages/`
2. Update components di `src/components/`
3. Tambah styles di `src/styles/`
4. Test dengan `npm run dev`
5. Build dengan `npm run build`

## 📄 License

Dikembangkan untuk Pemerintah Kota Bandung

---

**Last Updated:** 11 April 2026  
**Version:** 2.0 (Multi-page SPA with Routing)  
**Status:** ✅ Production Ready (Demo)

## Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)

## Built With

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **CSS3** - Styling with gradients and animations

## Notes

- Replace placeholder images (via.placeholder.com)
- Update dummy data with real program information
- Consider integrating with backend API for live data

---

Developed for Kota Bandung MBG Program
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
