import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDashboardStats, fetchHomeSummary } from '../apiDashboard'
import { adminMindmapSections } from './adminMindmap'
import '../../styles/AdminPanelPage.css'

type DashboardStats = {
  totals?: {
    tables?: number
    records?: number
    users?: number
    complaints?: number
  }
  tableCounts?: Record<string, number>
}

type ActiveCard = {
  label: string
  description: string
  value: number
  note?: string
}

const formatCount = (value: unknown) => {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

export default function AdminDashboardPage() {
  const token = localStorage.getItem('mbg_token')
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [summary, setSummary] = useState<{ totalPenerimaHariIni?: number } | null>(null)
  const [activeSection, setActiveSection] = useState(adminMindmapSections[0]?.key ?? 'laporan-harian')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Sesi admin belum ada. Silakan login terlebih dahulu.')
      setTimeout(() => navigate('/login'), 1200)
      return
    }

    const bootstrap = async () => {
      setLoading(true)
      setError('')

      try {
        const [statsResponse, summaryResponse] = await Promise.all([
          fetchDashboardStats(token),
          fetchHomeSummary(),
        ])

        setStats(statsResponse)
        setSummary(summaryResponse)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Dashboard admin gagal dimuat.')
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [navigate, token])

  const selectedSection = useMemo(
    () => adminMindmapSections.find((section) => section.key === activeSection) ?? adminMindmapSections[0],
    [activeSection],
  )

  const totalLaporanSekolah = formatCount(stats?.tableCounts?.laporan_sekolah)
  const totalLaporanSppg = formatCount(stats?.tableCounts?.laporan_sppg)
  const totalPengaduan = formatCount(stats?.tableCounts?.pengaduan)
  const totalBahanBaku = formatCount(stats?.tableCounts?.bahanbaku)
  const totalHariIni = formatCount(summary?.totalPenerimaHariIni)

  const sidebarSections = [
    { key: 'overview', label: 'Ikhtisar', hint: 'Ringkasan admin' },
    ...adminMindmapSections.map((section) => ({
      key: section.key,
      label: section.title,
      hint: section.description,
    })),
  ]

  const overviewCards = [
    { label: 'Sekolah', value: formatCount(stats?.tableCounts?.sekolah) },
    { label: 'SPPG', value: formatCount(stats?.tableCounts?.sppg) },
    { label: 'Kelompok', value: formatCount(stats?.tableCounts?.kelompok) },
    { label: 'Pengaduan', value: totalPengaduan },
  ]

  const activeCards: ActiveCard[] =
    activeSection === 'overview'
      ? [
          {
            label: 'Laporan Harian Sekolah',
            description: 'Rekap laporan konsumsi harian dari sekolah.',
            value: totalLaporanSekolah,
          },
          {
            label: 'Laporan SPPG',
            description: 'Rekap distribusi dari SPPG yang terdaftar.',
            value: totalLaporanSppg,
          },
          {
            label: 'Laporan Bahan Baku',
            description: 'Pantau bahan baku dan supplier.',
            value: totalBahanBaku,
          },
        ]
      : selectedSection.cards.map((card) => ({
          label: card.label,
          description: card.description,
          value: formatCount(card.table ? stats?.tableCounts?.[card.table] : 0),
          note: card.note,
        }))

  return (
    <main className="admin-page admin-page-mindmap">
      <div className="admin-layout admin-layout-mindmap">
        <aside className="admin-sidebar admin-sidebar-mindmap">
          <div>
            <div className="admin-brand">Admin MBG</div>
            <div className="admin-version">User Admin</div>

            <nav className="admin-nav admin-nav-mindmap" aria-label="Navigasi admin">
              {sidebarSections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  className={`admin-nav-item ${activeSection === section.key ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.key)}
                >
                  <span>{section.label}</span>
                  <small>{section.hint}</small>
                </button>
              ))}
            </nav>
          </div>

          <div className="admin-sidebar-foot">
            <button
              type="button"
              className="admin-text-btn"
              onClick={() => {
                localStorage.removeItem('mbg_token')
                localStorage.removeItem('mbg_role')
                window.location.href = '/login'
              }}
            >
              Sign Out
            </button>
          </div>
        </aside>

        <section className="admin-main admin-main-mindmap">
          <header className="admin-topbar admin-topbar-mindmap">
            <div>
              <p className="admin-kicker">Panel Admin MBG</p>
              <h1>Admin Biasa</h1>
              <p className="admin-topbar-subtitle">Kelola laporan harian, data SPPG, rekapitulasi, dan pengaduan sesuai mindmap.</p>
            </div>
            <div className="admin-topbar-tags">
              <span>Operasional</span>
              <span>Monitoring</span>
              <span>Read & Update</span>
            </div>
          </header>

          <section className="admin-stats-grid admin-stats-grid-mindmap" aria-label="Ringkasan admin">
            {overviewCards.map((card) => (
              <article key={card.label} className="admin-stat-card admin-stat-card-mindmap">
                <span>{card.label}</span>
                <p>{card.value}</p>
              </article>
            ))}
          </section>

          <section className="admin-mindmap-grid">
            <article className="admin-panel admin-panel-hero">
              <div className="admin-panel-head">
                <div>
                  <p className="admin-panel-eyebrow">{selectedSection.title}</p>
                  <h2>{selectedSection.description}</h2>
                </div>
              </div>

              {loading ? (
                <div className="admin-empty-state">Memuat data admin...</div>
              ) : error ? (
                <div className="admin-empty-state error">{error}</div>
              ) : (
                <div className="admin-mindmap-cards">
                  {activeCards.map((card) => (
                    <button key={card.label} type="button" className="admin-mindmap-card" onClick={() => setActiveSection(selectedSection.key)}>
                      <strong>{card.label}</strong>
                      <span>{card.description}</span>
                      <b>{card.value}</b>
                      {card.note && <small>{card.note}</small>}
                    </button>
                  ))}
                </div>
              )}
            </article>

            <article className="admin-panel admin-panel-note">
              <div className="admin-panel-head">
                <div>
                  <p className="admin-panel-eyebrow">Panduan Mindmap</p>
                  <h2>Struktur admin biasa</h2>
                </div>
              </div>

              <ul className="admin-note-list">
                <li>Laporan harian berisi sekolah, SPPG, dan bahan baku.</li>
                <li>Data SPPG berfokus pada data terhubung dan profil.</li>
                <li>Rekapitulasi menampilkan ringkasan laporan.</li>
                <li>Pengaduan dipantau dan ditindaklanjuti oleh admin.</li>
                <li>Laporan hari ini: {totalHariIni}</li>
              </ul>
            </article>
          </section>

          {error && !loading && <p className="admin-alert error">{error}</p>}
        </section>
      </div>
    </main>
  )
}
