import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, type PanelResponse } from '../../config/api'
import { PRIVATE_LOGIN_PATH } from '../../config/privateRoutes'
import '../../styles/RolePanelPage.css'

type ProfileForm = Record<string, string>
type ReportForm = Record<string, string>
type MenuForm = Record<string, string>

type DistribusiPhotoState = {
  menu: File | null
}
const emptyProfileForm = (): ProfileForm => ({})
const emptyReportForm = (): ReportForm => ({})
const emptyMenuForm = (): MenuForm => ({})

export default function SppgPanelPage() {
  const [distribusiPhoto, setDistribusiPhoto] = useState<DistribusiPhotoState>({ menu: null })
  const navigate = useNavigate()
  const token = localStorage.getItem('mbg_token')
  const [panel, setPanel] = useState<PanelResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingReport, setSavingReport] = useState(false)
  const [savingMenu, setSavingMenu] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm)
  const [reportForm, setReportForm] = useState<ReportForm>(emptyReportForm)
  const [menuForm, setMenuForm] = useState<MenuForm>(emptyMenuForm)
  const [activeTab, setActiveTab] = useState<'distribusi' | 'riwayat' | 'profil' | 'menu'>('distribusi')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadPanel = async () => {
    if (!token) {
      return
    }

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

  useEffect(() => {
    if (!token) {
      navigate(PRIVATE_LOGIN_PATH)
      return
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      })

      setMessage(response.message)
      await loadPanel()
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
      if (!reportForm.tanggal || !reportForm.sekolah_id) {
        setSavingReport(false)
        setError('Tanggal dan sekolah wajib diisi.')
        return
      }

      const formData = new FormData()
      formData.append('tanggal', reportForm.tanggal || '')
      formData.append('sekolah_id', String(reportForm.sekolah_id || ''))
      formData.append('porsi_distribusi', String(reportForm.porsi_distribusi || ''))
      if (reportForm.menu_id) {
        formData.append('menu_id', String(reportForm.menu_id || ''))
      }
      formData.append('status_delivery', reportForm.status_delivery || '')
      formData.append('status_terkirim', reportForm.status_terkirim || '')
      
      if (distribusiPhoto.menu) {
        formData.append('foto_menu', distribusiPhoto.menu)
      }

      console.log('Form data:', { tanggal: reportForm.tanggal, sekolah_id: reportForm.sekolah_id })

      const response = await apiRequest<{ message: string }>('/panel/distribution', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      setMessage(response.message)
      setReportForm(emptyReportForm())
      setDistribusiPhoto({ menu: null })
      await loadPanel()
    } catch (requestError) {
      console.error('Distribution submission error:', requestError)
      setError(requestError instanceof Error ? requestError.message : 'Gagal menyimpan laporan.')
    } finally {
      setSavingReport(false)
    }
  }

  const handleMenuSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token || !panel) {
      return
    }

    setSavingMenu(true)
    setMessage('')
    setError('')

    try {
      if (!menuForm.deskripsi) {
        setSavingMenu(false)
        setError('Deskripsi menu wajib diisi.')
        return
      }

      const response = await apiRequest<{ message: string; id: number }>('/panel/menu', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuForm),
      })

      setMessage(response.message)
      setMenuForm(emptyMenuForm())
      await loadPanel()
    } catch (requestError) {
      console.error('Menu submission error:', requestError)
      setError(requestError instanceof Error ? requestError.message : 'Gagal menyimpan menu.')
    } finally {
      setSavingMenu(false)
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

        {message && <div className="role-panel-alert success">{message}</div>}
        {error && <div className="role-panel-alert error">{error}</div>}

        <section className="role-panel-tabs" aria-label="Navigasi modul panel">
          {[
            { key: 'distribusi', label: 'Input Distribusi' },
            { key: 'menu', label: 'Manajemen Menu' },
            { key: 'riwayat', label: 'Riwayat Distribusi' },
            { key: 'profil', label: 'Profil SPPG' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`role-panel-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key as 'distribusi' | 'menu' | 'riwayat' | 'profil')}
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
                  <h2>Profil SPPG</h2>
                  <p>Atur data pengelola dan fasilitas operasional SPPG.</p>
                </div>
              </header>

              <form className="role-panel-form" onSubmit={handleProfileSubmit}>
                <label>
                  Nama SPPG
                  <input value={profileForm.nama_sppg ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, nama_sppg: event.target.value }))} />
                </label>
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
          )}

          {activeTab === 'distribusi' && (
            <div className="role-panel-card role-panel-full">
              <header className="role-panel-card-head">
                <div>
                  <h2>Input Distribusi Porsi</h2>
                  <p>Catat distribusi porsi harian untuk sekolah yang dilayani.</p>
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
                  Menu
                  <select value={reportForm.menu_id ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, menu_id: event.target.value }))}>
                    <option value="">-- Pilih Menu --</option>
                    {(panel?.options.menus ?? []).map((menu: any) => (
                      <option key={menu.id} value={menu.id}>{menu.code ?? menu.id} - {menu.deskripsi}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Status Pengiriman
                  <input value={reportForm.status_delivery ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, status_delivery: event.target.value }))} />
                </label>

                <label>
                  Foto Menu (JPG/PNG)
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null
                      setDistribusiPhoto({ menu: file })
                    }}
                  />
                  {distribusiPhoto.menu && <span>File: {distribusiPhoto.menu.name}</span>}
                </label>

                <button type="submit" className="role-panel-button" disabled={savingReport}>
                  {savingReport ? 'Menyimpan...' : 'Simpan Distribusi'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="role-panel-card role-panel-full">
              <header className="role-panel-card-head">
                <div>
                  <h2>Manajemen Menu</h2>
                  <p>Buat dan kelola menu yang dapat dipilih saat input distribusi.</p>
                </div>
              </header>

              <form className="role-panel-form" onSubmit={handleMenuSubmit}>
                <label>
                  Kategori
                  <input type="text" value={menuForm.kategori ?? ''} onChange={(event) => setMenuForm((prev) => ({ ...prev, kategori: event.target.value }))} placeholder="Contoh: Menu Utama, Menu Harian, dll" />
                </label>
                <label>
                  Deskripsi
                  <textarea value={menuForm.deskripsi ?? ''} onChange={(event) => setMenuForm((prev) => ({ ...prev, deskripsi: event.target.value }))} placeholder="Keterangan menu" required />
                </label>
                <label>
                  Kalori
                  <input type="number" min="0" value={menuForm.kalori ?? ''} onChange={(event) => setMenuForm((prev) => ({ ...prev, kalori: event.target.value }))} placeholder="Contoh: 550" />
                </label>
                <label>
                  Protein
                  <input type="number" min="0" value={menuForm.protein ?? ''} onChange={(event) => setMenuForm((prev) => ({ ...prev, protein: event.target.value }))} placeholder="Contoh: 25" />
                </label>
                <label>
                  Karbohidrat
                  <input type="number" min="0" value={menuForm.karbohidrat ?? ''} onChange={(event) => setMenuForm((prev) => ({ ...prev, karbohidrat: event.target.value }))} placeholder="Contoh: 70" />
                </label>
                <label>
                  Lemak
                  <input type="number" min="0" value={menuForm.lemak ?? ''} onChange={(event) => setMenuForm((prev) => ({ ...prev, lemak: event.target.value }))} placeholder="Contoh: 15" />
                </label>
                <label>
                  Jumlah
                  <input type="number" min="0" value={menuForm.jumlah ?? ''} onChange={(event) => setMenuForm((prev) => ({ ...prev, jumlah: event.target.value }))} placeholder="Contoh: 1" />
                </label>

                <button type="submit" className="role-panel-button" disabled={savingMenu}>
                  {savingMenu ? 'Menyimpan...' : 'Tambah Menu'}
                </button>
              </form>

              <div style={{ marginTop: 30 }}>
                <h3>Daftar Menu</h3>
                {(panel?.options.menus ?? []).length === 0 ? (
                  <p style={{ color: '#999' }}>Belum ada menu. Buat menu baru untuk menampilkan di sini.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #ddd' }}>
                        <th style={{ padding: 10, textAlign: 'left' }}>Kode Menu</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>Deskripsi</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>Kategori</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>Kalori</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>Protein</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>Karbohidrat</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>Lemak</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(panel?.options.menus ?? []).map((menu: any) => (
                        <tr key={menu.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: 10 }}>{menu.code ?? menu.id}</td>
                          <td style={{ padding: 10 }}>{menu.deskripsi || '-'}</td>
                          <td style={{ padding: 10 }}>{menu.kategori || '-'}</td>
                          <td style={{ padding: 10 }}>{menu.kalori ?? '-'}</td>
                          <td style={{ padding: 10 }}>{menu.protein ?? '-'}</td>
                          <td style={{ padding: 10 }}>{menu.karbohidrat ?? '-'}</td>
                          <td style={{ padding: 10 }}>{menu.lemak ?? '-'}</td>
                          <td style={{ padding: 10 }}>{menu.jumlah ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'riwayat' && (
            <div className="role-panel-card role-panel-full">
              <header className="role-panel-card-head">
                <div>
                  <h2>Riwayat Distribusi</h2>
                  <p>Tanggal, sekolah, dan jumlah porsi distribusi terakhir.</p>
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
                    {recentReports.length > 0 ? recentReports.map((item, index) => (
                      <tr key={String(item.id ?? item.created_at ?? `${item.tanggal ?? 'unknown'}-${index}`)}>
                        <td>{String(item.tanggal ?? item.created_at ?? '-')}</td>
                        <td>{String(item.sekolah_nama ?? item.sekolah ?? '-')}</td>
                        <td>{String(item.porsi_distribusi ?? item.porsi ?? '-')}</td>
                        <td>{String(item.status_delivery ?? item.status_terkirim ?? '-')}</td>
                        <td>{String(item.menu_deskripsi ?? item.menu ?? '-')}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="role-panel-empty">Belum ada riwayat distribusi.</td>
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
