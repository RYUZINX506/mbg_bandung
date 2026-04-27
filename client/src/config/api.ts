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
    throw new Error(payload?.message ?? 'Request gagal.')
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
      kelompok: number
      sppg: number
      laporanSekolah: number
      pengaduan: number
      totalPenerimaHariIni: number
      totalTargetPenerima: number
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
    jumlahPenerima: number
    jumlahDikonsumsi: number
    sisa: number
    keterangan: string | null
  }>
}

export type SppgDetail = {
  id: number
  name: string
  address: string
  status: string
  stats: Array<{
    label: string
    value: string
    sub: string
  }>
  contact: {
    phone: string
    email: string
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
    }
  }
}

