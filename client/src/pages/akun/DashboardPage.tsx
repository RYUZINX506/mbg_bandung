import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDashboardStats, fetchHomeSummary, fetchTableCount } from '../apiDashboard'
import '../../styles/AdminPanelPage.css'

export default function DashboardPage() {
  const token = localStorage.getItem('mbg_token')
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [tables, setTables] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [laporanHariIni, setLaporanHariIni] = useState<number>(0)
  const [laporanSekolah, setLaporanSekolah] = useState<number>(0)
  const [laporanSppg, setLaporanSppg] = useState<number>(0)
  const [laporanMenu, setLaporanMenu] = useState<number>(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Sesi admin belum ada. Silakan login terlebih dahulu.')
      setTimeout(() => navigate('/login'), 1200)
      return
    }
    // Ambil statistik utama
    fetchDashboardStats(token).then(setStats)
    // Ambil summary home
    fetchHomeSummary().then(setSummary)
    // Ambil statistik laporan
    fetchTableCount('laporan_sekolah', token).then(setLaporanSekolah)
    fetchTableCount('laporan_sppg', token).then(setLaporanSppg)
    fetchTableCount('menu', token).then(setLaporanMenu)
    // Laporan hari ini = summary?.totalPenerimaHariIni
  }, [token, navigate])

  useEffect(() => {
    if (summary && summary.totalPenerimaHariIni) {
      setLaporanHariIni(summary.totalPenerimaHariIni)
    }
  }, [summary])

  useEffect(() => {
    if (stats && stats.tableCounts) {
      setTables(Object.entries(stats.tableCounts).map(([name, rowCount]) => ({ name, rowCount })))
    }
  }, [stats])

  return (
    <main className="admin-page">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div>
            <div className="admin-brand">MBG Admin</div>
            <div className="admin-version">Database Modules</div>
            <nav className="admin-nav" aria-label="Modul dari database">
              <a
                href="/dashboard"
                className="admin-nav-item active"
                style={{ display: 'flex', alignItems: 'center', fontWeight: 600, borderLeft: '4px solid #dc2626', paddingLeft: '0.5rem' }}
              >
                Dashboard
              </a>
              {tables.map((table) => (
                <a
                  key={table.name}
                  href={table.name === 'users' ? '/panel' : `/panel/${table.name}`}
                  className="admin-nav-item"
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <span>{table.name.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
                  <small>{table.rowCount}</small>
                </a>
              ))}
            </nav>
          </div>
          <div className="admin-sidebar-foot">
            <button
              type="button"
              className="admin-text-btn"
              onClick={() => {
                localStorage.removeItem('mbg_token')
                window.location.href = '/login'
              }}
            >
              Sign Out
            </button>
          </div>
        </aside>
        <section className="admin-main">
          <header className="admin-topbar">
            <div>
              <h1 style={{fontSize: '1.2rem', fontWeight: 800, color: '#1e40af'}}>Dashboard Admin</h1>
              <p style={{fontSize: '0.9rem', color: '#334155'}}>Selamat datang di dashboard admin MBG.</p>
            </div>
          </header>
          <section className="admin-stats-grid" aria-label="Ringkasan database">
            <article className="admin-stat-card"><span>Jumlah Tabel</span><p>{stats?.totals?.tables ?? '-'}</p></article>
            <article className="admin-stat-card"><span>Total Record</span><p>{stats?.totals?.records ?? '-'}</p></article>
            <article className="admin-stat-card"><span>Pengguna</span><p>{stats?.totals?.users ?? '-'}</p></article>
            <article className="admin-stat-card"><span>Pengaduan</span><p>{stats?.totals?.complaints ?? '-'}</p></article>
            <article className="admin-stat-card"><span>Laporan Hari Ini</span><p>{laporanHariIni ?? '-'}</p></article>
            <article className="admin-stat-card"><span>Laporan Sekolah</span><p>{laporanSekolah ?? '-'}</p></article>
            <article className="admin-stat-card"><span>Laporan SPPG</span><p>{laporanSppg ?? '-'}</p></article>
            <article className="admin-stat-card"><span>Laporan Menu</span><p>{laporanMenu ?? '-'}</p></article>
          </section>

          {/* Statistik tambahan kreatif */}
          <section style={{marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem'}}>
            <div style={{background: '#fff', borderRadius: 14, boxShadow: '0 8px 24px -12px #cbd5e1', padding: '1.2rem'}}>
              <h3 style={{fontSize: '1rem', color: '#1e40af', margin: 0, marginBottom: 8}}>Distribusi Data</h3>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 18, height: 120}}>
                <div style={{flex: 1, textAlign: 'center'}}>
                  <div style={{background: '#2563eb', height: `${(stats?.totals?.users ?? 0) * 10}px`, borderRadius: 8, marginBottom: 6}}></div>
                  <span style={{fontSize: 13, color: '#64748b'}}>User</span>
                </div>
                <div style={{flex: 1, textAlign: 'center'}}>
                  <div style={{background: '#f59e42', height: `${(stats?.totals?.complaints ?? 0) * 10}px`, borderRadius: 8, marginBottom: 6}}></div>
                  <span style={{fontSize: 13, color: '#64748b'}}>Pengaduan</span>
                </div>
                <div style={{flex: 1, textAlign: 'center'}}>
                  <div style={{background: '#10b981', height: `${(stats?.totals?.tables ?? 0) * 4}px`, borderRadius: 8, marginBottom: 6}}></div>
                  <span style={{fontSize: 13, color: '#64748b'}}>Tabel</span>
                </div>
                <div style={{flex: 1, textAlign: 'center'}}>
                  <div style={{background: '#ef4444', height: `${(stats?.totals?.records ?? 0) * 2}px`, borderRadius: 8, marginBottom: 6}}></div>
                  <span style={{fontSize: 13, color: '#64748b'}}>Record</span>
                </div>
              </div>
            </div>
            <div style={{background: '#fff', borderRadius: 14, boxShadow: '0 8px 24px -12px #cbd5e1', padding: '1.2rem'}}>
              <h3 style={{fontSize: '1rem', color: '#1e40af', margin: 0, marginBottom: 8}}>Highlight</h3>
              <ul style={{margin: 0, padding: 0, listStyle: 'none', fontSize: 15, color: '#334155'}}>
                <li>📈 <b>{stats?.totals?.records ?? 0}</b> total data tercatat</li>
                <li>👥 <b>{stats?.totals?.users ?? 0}</b> pengguna aktif</li>
                <li>🗂️ <b>{stats?.totals?.tables ?? 0}</b> tabel database</li>
                <li>⚠️ <b>{stats?.totals?.complaints ?? 0}</b> pengaduan masuk</li>
                <li>📅 <b>{laporanHariIni ?? 0}</b> laporan hari ini</li>
                <li>🏫 <b>{laporanSekolah ?? 0}</b> laporan sekolah</li>
                <li>🏭 <b>{laporanSppg ?? 0}</b> laporan SPPG</li>
                <li>🍽️ <b>{laporanMenu ?? 0}</b> laporan menu</li>
              </ul>
            </div>
          </section>
          {error && <p className="admin-alert error">{error}</p>}
        </section>
      </div>
    </main>
  )
}
