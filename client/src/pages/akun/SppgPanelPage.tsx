import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, type PanelResponse } from '../../config/api'
import { PRIVATE_LOGIN_PATH } from '../../config/privateRoutes'
import '../../styles/RolePanelPage.css'

type ProfileForm = Record<string, string>
type ReportForm = Record<string, string>

const emptyProfileForm = (): ProfileForm => ({})
const emptyReportForm = (): ReportForm => ({})

export default function SppgPanelPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem('mbg_token')
  const [panel, setPanel] = useState<PanelResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingReport, setSavingReport] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm)
  const [reportForm, setReportForm] = useState<ReportForm>(emptyReportForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      navigate(PRIVATE_LOGIN_PATH)
      return
    }

    const loadPanel = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await apiRequest<PanelResponse>('/panel', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setPanel(response.data)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Panel gagal dimuat.')
      } finally {
        setLoading(false)
      }
    }

    void loadPanel()
  }, [navigate, token])

  useEffect(() => {
    if (!panel?.profile.record) {
      return
    }

    const nextProfile: ProfileForm = {}
    Object.entries(panel.profile.record).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        nextProfile[key] = ''
        return
      }

      nextProfile[key] = String(value)
    })

    setProfileForm(nextProfile)
  }, [panel])

  useEffect(() => {
    if (!panel?.user.role) {
      return
    }

    if (panel.user.role !== 'sppg') {
      navigate(`/panel/${panel.user.role}`, { replace: true })
    }
  }, [navigate, panel?.user.role])

  const summaryCards = useMemo(() => {
    if (!panel) {
      return []
    }

    return [
      { label: 'Sekolah', value: panel.summary.sekolah },
      { label: 'SPPG', value: panel.summary.sppg },
      { label: 'Kelompok', value: panel.summary.kelompok },
      { label: 'Pengaduan', value: panel.summary.pengaduan },
    ]
  }, [panel])

  const recentReports = panel?.recent.reports ?? []

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token || !panel) {
      return
    }

    setSavingProfile(true)
    setMessage('')
    setError('')

    try {
      const endpoint = '/panel/profile'
      const response = await apiRequest<{ message: string }>(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      })

      setMessage(response.message)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menyimpan profil.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleReportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token || !panel) {
      return
    }

    setSavingReport(true)
    setMessage('')
    setError('')

    try {
      const response = await apiRequest<{ message: string }>('/panel/distribution', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reportForm),
      })

      setMessage(response.message)
      setReportForm(emptyReportForm())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menyimpan laporan.')
    } finally {
      setSavingReport(false)
    }
  }

  if (loading) {
    return <main className="role-panel-page"><div className="role-panel-shell"><div className="role-panel-empty">Memuat panel...</div></div></main>
  }

  if (!panel) {
    return <main className="role-panel-page"><div className="role-panel-shell"><div className="role-panel-empty">Panel tidak ditemukan.</div></div></main>
  }

  return (
    <main className="role-panel-page">
      <div className="role-panel-shell">
        <section className="role-panel-hero">
          <div>
            <p className="role-panel-kicker">{panel.roleScope.title}</p>
            <h1>{panel.user.name}</h1>
            <p className="role-panel-subtitle">{panel.roleScope.description}</p>
          </div>
          <div className="role-panel-badges">
            <span>{panel.user.role}</span>
            <span>{panel.user.kode ?? '-'}</span>
          </div>
        </section>

        <section className="role-panel-summary" aria-label="Ringkasan">
          {summaryCards.map((item) => (
            <article key={item.label} className="role-summary-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        {message && <div className="role-panel-alert success">{message}</div>}
        {error && <div className="role-panel-alert error">{error}</div>}

        <section className="role-panel-grid">
          <div className="role-panel-card">
            <header className="role-panel-card-head">
              <div>
                <h2>Atur Profil</h2>
                <p>Ubah alamat, nomor telepon, email, dan data relasi yang tersedia di database.</p>
              </div>
            </header>

            <form className="role-panel-form" onSubmit={handleProfileSubmit}>
              <label>
                Nama Pengelola
                <input value={profileForm.nama_pengelola ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, nama_pengelola: event.target.value }))} />
              </label>
              <label>
                Alamat
                <textarea value={profileForm.alamat ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, alamat: event.target.value }))} />
              </label>
              <label>
                No Telepon
                <input value={profileForm.no_telepon_pengelola ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, no_telepon_pengelola: event.target.value }))} />
              </label>
              <label>
                Email
                <input type="email" value={profileForm.email_pengelola ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, email_pengelola: event.target.value }))} />
              </label>
              <label>
                Kapasitas Harian
                <input type="number" value={profileForm.kapasitas_harian ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, kapasitas_harian: event.target.value }))} />
              </label>
              <label>
                Fasilitas Dapur
                <input value={profileForm.fasilitas_dapur ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, fasilitas_dapur: event.target.value }))} />
              </label>
              <label>
                Status Operasional
                <input value={profileForm.status_operasional ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, status_operasional: event.target.value }))} />
              </label>
              <label>
                Kecamatan
                <select value={profileForm.kecamatan_id ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, kecamatan_id: event.target.value }))}>
                  <option value="">Pilih kecamatan</option>
                  {panel.options.kecamatan.map((item) => (
                    <option key={item.id} value={item.id}>{item.nama_kecamatan}</option>
                  ))}
                </select>
              </label>
              <label>
                Jenis Dapur
                <select value={profileForm.jenis_dapur_id ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, jenis_dapur_id: event.target.value }))}>
                  <option value="">Pilih jenis dapur</option>
                  {panel.options.jenisDapur.map((item) => (
                    <option key={item.id} value={item.id}>{item.nama}</option>
                  ))}
                </select>
              </label>

              <button type="submit" className="role-panel-button" disabled={savingProfile}>
                {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </form>
          </div>

          <div className="role-panel-card">
            <header className="role-panel-card-head">
              <div>
                <h2>Input Laporan Distribusi Porsi</h2>
                <p>Isi distribusi harian ke sekolah yang dilayani.</p>
              </div>
            </header>

            <form className="role-panel-form" onSubmit={handleReportSubmit}>
              <label>
                Tanggal
                <input type="date" value={reportForm.tanggal ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, tanggal: event.target.value }))} />
              </label>

              <label>
                Sekolah
                <select value={reportForm.sekolah_id ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, sekolah_id: event.target.value }))}>
                  <option value="">Pilih sekolah</option>
                  {panel.options.sekolah.map((school) => (
                    <option key={school.id} value={school.id}>{school.nama_sekolah}</option>
                  ))}
                </select>
              </label>
              <label>
                Porsi Distribusi
                <input type="number" value={reportForm.porsi_distribusi ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, porsi_distribusi: event.target.value }))} />
              </label>
              <label>
                Status Delivery
                <input value={reportForm.status_delivery ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, status_delivery: event.target.value }))} />
              </label>
              <label>
                Status Terkirim
                <input value={reportForm.status_terkirim ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, status_terkirim: event.target.value }))} />
              </label>
              <label>
                Menu
                <textarea value={reportForm.menu ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, menu: event.target.value }))} />
              </label>
              <label>
                Kategori Menu
                <input value={reportForm.kategori_menu ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, kategori_menu: event.target.value }))} />
              </label>

              <button type="submit" className="role-panel-button" disabled={savingReport}>
                {savingReport ? 'Menyimpan...' : 'Simpan Distribusi'}
              </button>
            </form>
          </div>
        </section>

        <section className="role-panel-card role-panel-full">
          <header className="role-panel-card-head">
            <div>
              <h2>Riwayat Terakhir</h2>
              <p>Distribusi porsi terakhir</p>
            </div>
          </header>

          <div className="role-panel-table">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Sekolah</th>
                  <th>Porsi</th>
                  <th>Status</th>
                  <th>Menu</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((item) => (
                  <tr key={String(item.id)}>
                    <td>{String(item.tanggal ?? '-')}</td>
                    <td>{String(item.sekolah_nama ?? '-')}</td>
                    <td>{String(item.porsi_distribusi ?? '-')}</td>
                    <td>{String(item.status_delivery ?? '-')}</td>
                    <td>{String(item.menu_deskripsi ?? '-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
