import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, type PanelResponse } from '../../config/api'
import { PRIVATE_LOGIN_PATH } from '../../config/privateRoutes'
import '../../styles/RolePanelPage.css'

type ProfileForm = Record<string, string>
type ReportForm = Record<string, string>
type SchoolPhotoState = {
  menu: File | null
  siswaMakan: File | null
}

const emptyProfileForm = (): ProfileForm => ({})
const emptyReportForm = (): ReportForm => ({})

export default function SekolahPanelPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem('mbg_token')
  const [panel, setPanel] = useState<PanelResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingReport, setSavingReport] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm)
  const [reportForm, setReportForm] = useState<ReportForm>(emptyReportForm)
  const [activeTab, setActiveTab] = useState<'laporan' | 'riwayat' | 'profil'>('laporan')
  const [schoolPhotos, setSchoolPhotos] = useState<SchoolPhotoState>({
    menu: null,
    siswaMakan: null,
  })
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

    if (panel.user.role !== 'sekolah') {
      navigate(`/panel/${panel.user.role}`, { replace: true })
    }
  }, [navigate, panel?.user.role])

  const schoolName = String(panel?.profile.record?.nama_sekolah ?? panel?.user.name ?? '-')
  const schoolAddress = String(panel?.profile.record?.alamat ?? 'Alamat belum tersedia')

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
      if (!schoolPhotos.menu || !schoolPhotos.siswaMakan) {
        setSavingReport(false)
        setError('Foto menu dan foto siswa sedang makan wajib diunggah.')
        return
      }

      const formData = new FormData()
      formData.append('tanggal', reportForm.tanggal ?? '')
      formData.append('jumlah_penerima', reportForm.jumlah_penerima ?? '')
      formData.append('jumlah_dikonsumsi', reportForm.jumlah_dikonsumsi ?? '')
      formData.append('sisa', reportForm.sisa ?? '')
      formData.append('keterangan', reportForm.keterangan ?? '')
      formData.append('foto_menu', schoolPhotos.menu)
      formData.append('foto_siswa_makan', schoolPhotos.siswaMakan)

      const response = await apiRequest<{ message: string }>('/panel/report', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      setMessage(response.message)
      setReportForm(emptyReportForm())
      setSchoolPhotos({ menu: null, siswaMakan: null })
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
          <div className="role-panel-hero-copy">
            <p className="role-panel-kicker">Profil Sekolah</p>
            <h1>{schoolName}</h1>
            <p className="role-panel-subtitle">{schoolAddress}</p>
          </div>
          <div className="role-panel-badges">
            <span>{panel.user.role}</span>
            <span>{panel.user.kode ?? '-'}</span>
          </div>
        </section>

        {message && <div className="role-panel-alert success">{message}</div>}
        {error && <div className="role-panel-alert error">{error}</div>}

        <section className="role-panel-tabs" aria-label="Navigasi modul panel">
          {[
            { key: 'laporan', label: 'Input Laporan' },
            { key: 'riwayat', label: 'Riwayat Laporan' },
            { key: 'profil', label: 'Profil Sekolah' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`role-panel-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key as 'laporan' | 'riwayat' | 'profil')}
            >
              {tab.label}
            </button>
          ))}
        </section>

        <section className="role-panel-content">
          {activeTab === 'profil' && (
            <div className="role-panel-card role-panel-full">
              <header className="role-panel-card-head">
                <div>
                  <h2>Profil Sekolah</h2>
                  <p>Perbarui data sekolah dan informasi hubungan dengan program.</p>
                </div>
              </header>

              <form className="role-panel-form" onSubmit={handleProfileSubmit}>
                <label>
                  Nama Sekolah
                  <input value={profileForm.nama_sekolah ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, nama_sekolah: event.target.value }))} />
                </label>
                <label>
                  Alamat
                  <textarea value={profileForm.alamat ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, alamat: event.target.value }))} />
                </label>
                <label>
                  No Telepon
                  <input value={profileForm.no_telepon ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, no_telepon: event.target.value }))} />
                </label>
                <label>
                  Email
                  <input type="email" value={profileForm.email ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))} />
                </label>
                <label>
                  Nama Kepala Sekolah
                  <input value={profileForm.nama_kepala_sekolah ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, nama_kepala_sekolah: event.target.value }))} />
                </label>
                <label>
                  No Telepon Kepala Sekolah
                  <input value={profileForm.no_telepon_kepala_sekolah ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, no_telepon_kepala_sekolah: event.target.value }))} />
                </label>
                <label>
                  Jenis Sekolah
                  <input value={profileForm.jenis_sekolah ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, jenis_sekolah: event.target.value }))} />
                </label>
                <label>
                  Total Siswa
                  <input type="number" value={profileForm.total_siswa ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, total_siswa: event.target.value }))} />
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

                <button type="submit" className="role-panel-button" disabled={savingProfile}>
                  {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'laporan' && (
            <div className="role-panel-card role-panel-full">
              <header className="role-panel-card-head">
                <div>
                  <h2>Input Laporan Sekolah</h2>
                  <p>Isi laporan konsumsi dan dokumentasi harian sekolah.</p>
                </div>
              </header>

              <form className="role-panel-form" onSubmit={handleReportSubmit}>
                <label>
                  Tanggal
                  <input type="date" value={reportForm.tanggal ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, tanggal: event.target.value }))} />
                </label>

                <label>
                  Jumlah Penerima
                  <input type="number" value={reportForm.jumlah_penerima ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, jumlah_penerima: event.target.value }))} />
                </label>
                <label>
                  Jumlah Dikonsumsi
                  <input type="number" value={reportForm.jumlah_dikonsumsi ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, jumlah_dikonsumsi: event.target.value }))} />
                </label>
                <label>
                  Sisa
                  <input type="number" value={reportForm.sisa ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, sisa: event.target.value }))} />
                </label>
                <label>
                  Keterangan
                  <textarea value={reportForm.keterangan ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, keterangan: event.target.value }))} />
                </label>
                <label>
                  Foto Menu (JPG/PNG)
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    required
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null
                      setSchoolPhotos((prev) => ({ ...prev, menu: file }))
                    }}
                  />
                </label>
                <label>
                  Foto Siswa Sedang Makan (JPG/PNG)
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    required
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null
                      setSchoolPhotos((prev) => ({ ...prev, siswaMakan: file }))
                    }}
                  />
                </label>

                <button type="submit" className="role-panel-button" disabled={savingReport}>
                  {savingReport ? 'Menyimpan...' : 'Simpan Laporan'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'riwayat' && (
            <div className="role-panel-card role-panel-full">
              <header className="role-panel-card-head">
                <div>
                  <h2>Riwayat Laporan</h2>
                  <p>Daftar laporan sekolah yang sudah tercatat.</p>
                </div>
              </header>

              <div className="role-panel-table">
                <table>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Penerima</th>
                      <th>Dikonsumsi</th>
                      <th>Sisa</th>
                      <th>Keterangan</th>
                      <th>Foto Menu</th>
                      <th>Foto Siswa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReports.length > 0 ? recentReports.map((item, index) => (
                      <tr key={String(item.id ?? item.created_at ?? `${item.tanggal ?? 'unknown'}-${index}`)}>
                        <td>{String(item.tanggal ?? item.created_at ?? '-')}</td>
                        <td>{String(item.jumlah_penerima ?? '-')}</td>
                        <td>{String(item.jumlah_dikonsumsi ?? '-')}</td>
                        <td>{String(item.sisa ?? '-')}</td>
                        <td>{String(item.keterangan ?? '-')}</td>
                        <td>
                          {item.foto_menu_url
                            ? <a href={String(item.foto_menu_url)} target="_blank" rel="noreferrer">Lihat Foto</a>
                            : '-'}
                        </td>
                        <td>
                          {item.foto_siswa_makan_url
                            ? <a href={String(item.foto_siswa_makan_url)} target="_blank" rel="noreferrer">Lihat Foto</a>
                            : '-'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="role-panel-empty">Belum ada riwayat laporan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
