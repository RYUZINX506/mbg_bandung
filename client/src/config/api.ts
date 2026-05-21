export const API_BASE_URL = '/api'

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`, {
      path,
      status: response.status,
      message: payload?.message,
      payload,
    })
    throw new Error(payload?.message ?? `Request gagal (${response.status}).`)
  }

  return payload as T
}

export type ApiListResponse<T> = {
  data: T[]
}

export type ApiDetailResponse<T> = {
  data: T
}

export type SchoolItem = {
  id: number
  name: string
  type: string
  kecamatan: string
  alamat: string
  siswa: number
  noTelp: string
  isActive: boolean
}

export type RoleOption = {
  id: number
  code: string
  label: string
  description: string | null
  sort_order: number
}

export type SppgItem = {
  id: number
  name: string
  kecamatan: string
  penerima: number
  status: string
  lokasi: string
}

export type HomeResponse = {
  data: {
    summary: {
      sekolah: number
      sekolahAktif?: number
      kelompok: number
      totalPenerimaKelompok?: number
      kelompokBumil?: number
      kelompokBalita?: number
      kelompokBusui?: number
      sppg: number
      totalSppg?: number
      sppgLaporHariIni?: number
      sppgBelumLapor?: number
      sekolahLaporHariIni?: number
      sekolahBelumLapor?: number
      laporanSekolah: number
      pengaduan: number
      totalPenerimaHariIni: number
      totalTargetPenerima: number
      totalDistribusiPorsiHariIni?: number
    }
    topSchools: Array<{
      id: number
      name: string
      type: string
      kecamatan: string
      siswa: number
    }>
    topSppg: Array<{
      id: number
      name: string
      kecamatan: string
      kapasitas: number
    }>
    distributionsBySchool?: Array<{
      schoolId: number
      name: string
      type: string
      kecamatan: string
      totalPorsi: number
      sppgCount: number
      lastUpdated?: string | null
    }>
    schoolReportsToday?: Array<{
      id: number
      schoolId: number
      name: string
      type: string
      kecamatan: string
      tanggal: string
      updatedAt: string
      hasMainPhoto: boolean
      hasSecondaryPhoto: boolean
      fotoMenuUrl?: string | null
      fotoSiswaUrl?: string | null
    }>
  }
}

export type SchoolDetail = {
  id: number
  rank: number
  name: string
  type: string
  status: string
  kecamatan: string
  alamat: string
  programStart: string | null
  jumlahSiswa: number
  sppg: {
    id: number | null
    name: string
    jenis: string
    kapasitas: number
  }
  distribusi: Array<{
    id: number
    tanggal: string
    menu: string
    porsi: number
    jam: string
  }>
  reports: Array<{
    id: number
    tanggal: string
    created_at: string
    createdAt?: string
    jumlahPenerima: number
    jumlahDikonsumsi: number
    sisa: number
    keterangan: string | null
    lokasi: {
      latitude: number | null
      longitude: number | null
      akurasi: number | null
      alamat: string
    }
    fotoMenuUrl: string | null
    fotoSiswaUrl: string | null
  }>
}

export type SppgDetail = {
  id: number
  name: string
  address: string
  status: string
  location: {
    latitude: number | null
    longitude: number | null
    address: string
    district: string
    mapUrl: string | null
    mapsLink: string | null
  }
  stats: Array<{
    label: string
    value: string
    sub: string
  }>
  contact: {
    phone: string
    email: string
    name: string
  }
  facilities: string[]
  photos: string[]
  nutritionist: {
    name: string
    title: string
    org: string
  }
  certificate: {
    name: string
    number: string
    issued: string
    validUntil: string
  }
  distribusi: Array<{
    id: number
    tanggal: string
    createdAt?: string | null
    sekolah: string
    level: string
    menu: string
    porsi: number
    kalori?: number | null
    protein?: number | null
    karbo?: number | null
    lemak?: number | null
    status: string
    fotoMenuUrl?: string | null
  }>
  reports: Array<{
    id: number
    tanggal: string
    created_at: string
    createdAt?: string
    schoolName: string
    schoolType: string
    jumlahPenerima: number
    jumlahDikonsumsi: number
    sisa: number
    keterangan: string | null
    lokasi: {
      latitude: number | null
      longitude: number | null
      akurasi: number | null
      alamat: string
    }
    fotoMenuUrl: string | null
    fotoSiswaUrl: string | null
  }>
  servedSchools: Array<{
    id: number
    name: string
    status: string
    address: string
    level: string
  }>
}

export type GroupItem = {
  id: number
  name: string
  category: string
  kecamatan: string
  santri: number
  kabupaten: string
}

export type GroupDetail = {
  id: number
  name: string
  subtitle: string
  description: string
  icon: string
  color: string
  jenis: string
  statusProgram: string
  sppg: {
    name: string
    jumlah: string
    porsi: string
    status: string
  }
  infoDetail: {
    jenis: string
    lokasi: string
    jumlahAnggota: number
    nomorReg: string
    statusProgram: string
    tanggalBergabung: string | null
  }
  sppgDetail: Array<{
    id: number
    nama: string
    lokasi: string
    porsi: string
    status: string
    penanggungjawab: string
  }>
  distribusiDetail: Array<{
    hari: string
    waktu: string
    menu: string
    jumlah: string
  }>
}

export type PanelResponse = {
  data: {
    user: {
      id: number
      kode: string | null
      name: string
      email: string | null
      role: string | null
      sekolahId: number | null
      sppgId: number | null
    }
    summary: {
      sekolah: number
      kelompok: number
      sppg: number
      pengaduan: number
    }
    roleScope: {
      title: string
      description: string
    }
    profile: {
      type: 'sekolah' | 'sppg' | 'generic'
      record: Record<string, unknown> | null
    }
    recent: {
      reports: Array<Record<string, unknown>>
    }
    options: {
      role: string | null
      kecamatan: Array<{ id: number; nama_kecamatan: string }>
      jenisDapur: Array<{ id: number; nama: string }>
      sekolah: Array<{ id: number; nama_sekolah: string; jenis_sekolah: string | null; alamat: string | null }>
      menus?: Array<{
        id: number
        code: string
        deskripsi: string
        kategori: string | null
        kalori: number | null
        protein: number | null
        karbohidrat: number | null
        lemak: number | null
        jumlah: number | null
      }>
    }
  }
}

