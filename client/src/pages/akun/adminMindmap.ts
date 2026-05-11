export type MindmapCard = {
  label: string
  description: string
  table?: string
  note?: string
}

export type MindmapSection = {
  key: string
  title: string
  description: string
  cards: MindmapCard[]
}

export type TableGroup = {
  key: string
  title: string
  description: string
  tables: string[]
}

export const adminMindmapSections: MindmapSection[] = [
  {
    key: 'laporan-harian',
    title: 'Laporan Harian',
    description: 'Pantau laporan harian yang masuk dari sekolah dan SPPG.',
    cards: [
      {
        label: 'Laporan Harian Sekolah',
        description: 'Masuk dan review laporan harian sekolah.',
        table: 'laporan_sekolah',
        note: 'Read only overview',
      },
      {
        label: 'Laporan SPPG',
        description: 'Monitor laporan distribusi harian dari SPPG.',
        table: 'laporan_sppg',
        note: 'Read only overview',
      },
      {
        label: 'Laporan Bahan Baku',
        description: 'Lihat data bahan baku dan pemasok yang dipakai.',
        table: 'bahanbaku',
        note: 'Reference data',
      },
    ],
  },
  {
    key: 'data-sppg',
    title: 'Data SPPG',
    description: 'Kelola data SPPG, informasi sekolah, dan akun yang terhubung.',
    cards: [
      {
        label: 'Data SPPG',
        description: 'Data SPPG dapat dibaca dan diubah oleh admin.',
        table: 'sppg',
        note: 'Read & update',
      },
      {
        label: 'Informasi SPPG',
        description: 'Profil, alamat, dan kontak operasional SPPG.',
        table: 'sppg',
        note: 'Profile information',
      },
      {
        label: 'Informasi Sekolah',
        description: 'Data sekolah yang terhubung ke program.',
        table: 'sekolah',
        note: 'Profile information',
      },
    ],
  },
  {
    key: 'rekapitulasi-laporan',
    title: 'Rekapitulasi Laporan',
    description: 'Lihat ringkasan laporan dari sekolah dan SPPG.',
    cards: [
      {
        label: 'Laporan SPPG',
        description: 'Rekap distribusi dari sisi SPPG.',
        table: 'laporan_sppg',
        note: 'Recap view',
      },
      {
        label: 'Laporan Sekolah',
        description: 'Rekap laporan konsumsi dari sekolah.',
        table: 'laporan_sekolah',
        note: 'Recap view',
      },
    ],
  },
  {
    key: 'kelola-pengaduan',
    title: 'Kelola Pengaduan',
    description: 'Pantau dan tindak lanjuti pengaduan yang masuk.',
    cards: [
      {
        label: 'Pengaduan Masuk',
        description: 'Lihat daftar pengaduan untuk diproses.',
        table: 'pengaduan',
        note: 'Queue management',
      },
      {
        label: 'Status Tindak Lanjut',
        description: 'Pantau progres penyelesaian pengaduan.',
        table: 'pengaduan',
        note: 'Follow up',
      },
    ],
  },
]

export const superadminTableGroups: TableGroup[] = [
  {
    key: 'laporan-harian',
    title: 'Laporan Harian',
    description: 'Data laporan harian dan file pendukung.',
    tables: ['laporan_sekolah', 'laporan_sppg', 'file_path', 'laporan_lokasi'],
  },
  {
    key: 'data-sppg',
    title: 'Data SPPG',
    description: 'Master data SPPG, sekolah, dan relasi pengguna.',
    tables: ['sppg', 'sekolah', 'users', 'user_profiles'],
  },
  {
    key: 'rekapitulasi-laporan',
    title: 'Rekapitulasi Laporan',
    description: 'Ringkasan laporan sekolah dan laporan SPPG.',
    tables: ['laporan_sppg', 'laporan_sekolah'],
  },
  {
    key: 'master-data',
    title: 'Data Master',
    description: 'Kecamatan, fasilitas, satuan, supplier, dan bahan baku.',
    tables: ['kecamatan', 'status_program', 'satuan', 'jenis_dapur', 'fasilitas_dapur', 'supplier', 'bahanbaku', 'kelompok'],
  },
  {
    key: 'pengaduan',
    title: 'Kelola Pengaduan',
    description: 'Data pengaduan dan tindak lanjutnya.',
    tables: ['pengaduan'],
  },
  {
    key: 'informasi-akun',
    title: 'Informasi Akun',
    description: 'Akun pengguna dan pemetaan role.',
    tables: ['users', 'roles', 'user_profiles'],
  },
]

export const tableLabels: Record<string, string> = {
  users: 'Users',
  roles: 'Roles',
  kecamatan: 'Kecamatan',
  status_program: 'Status Program',
  satuan: 'Satuan',
  jenis_dapur: 'Jenis Dapur',
  fasilitas_dapur: 'Fasilitas Dapur',
  user_profiles: 'User Profiles',
  supplier: 'Supplier',
  bahanbaku: 'Bahan Baku',
  kelompok: 'Kelompok',
  sekolah: 'Sekolah',
  sppg: 'SPPG',
  laporan_sekolah: 'Laporan Sekolah',
  laporan_lokasi: 'Laporan Lokasi',
  file_path: 'File Path',
  laporan_sppg: 'Laporan SPPG',
  menu: 'Menu',
  pengaduan: 'Pengaduan',
}

export const getTableLabel = (tableName: string): string => {
  if (tableLabels[tableName]) {
    return tableLabels[tableName]
  }

  return tableName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const getTableGroup = (tableName: string): TableGroup | null =>
  superadminTableGroups.find((group) => group.tables.includes(tableName)) ?? null
