// Helper API untuk statistik dashboard admin
import { apiRequest } from '../config/api'

export async function fetchDashboardStats(token: string) {
  // Ambil statistik utama dari endpoint admin
  const stats = await apiRequest<any>('/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return stats.data
}

export async function fetchHomeSummary() {
  // Ambil statistik summary dari endpoint home
  const res = await apiRequest<any>('/home')
  return res.data.summary
}

export async function fetchTableCount(table: string, token: string) {
  // Ambil jumlah data dari tabel tertentu
  const res = await apiRequest<any>(`/admin/rows/${table}?perPage=1`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.meta.total
}
