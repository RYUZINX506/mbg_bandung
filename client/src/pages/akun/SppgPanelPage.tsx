import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, type PanelResponse } from '../../config/api'
import { PRIVATE_LOGIN_PATH } from '../../config/privateRoutes'
import '../../styles/RolePanelPage.css'

type ProfileForm = Record<string, string>
type ReportForm = Record<string, string>
type MenuForm = Record<string, string>
type SchoolAllocationForm = Record<string, { porsi: string; catatan: string }>

type BahanBakuRow = {
  id: string
  nama: string
  jumlah: string
}

type DistribusiPhotoState = {
  menu: File | null
}
const emptyProfileForm = (): ProfileForm => ({})
const getLocalDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const emptyReportForm = (): ReportForm => ({ tanggal: getLocalDateString() })
const emptyMenuForm = (): MenuForm => ({})
const emptySchoolAllocationForm = (): SchoolAllocationForm => ({})

const emptyBahanBakuRow = (): BahanBakuRow => ({ id: String(Date.now() + Math.random()), nama: '', jumlah: '' })

export default function SppgPanelPage() {
  const [distribusiPhoto, setDistribusiPhoto] = useState<DistribusiPhotoState>({ menu: null })
  const navigate = useNavigate()
  const token = localStorage.getItem('mbg_token')
  const [panel, setPanel] = useState<PanelResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingReport, setSavingReport] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm)
  const [reportForm, setReportForm] = useState<ReportForm>(emptyReportForm)
  const [menuForm, setMenuForm] = useState<MenuForm>(emptyMenuForm)
  const [bahanBakuRows, setBahanBakuRows] = useState<BahanBakuRow[]>([emptyBahanBakuRow()])
  const [schoolAllocationForm, setSchoolAllocationForm] = useState<SchoolAllocationForm>(emptySchoolAllocationForm)
  const [activeTab, setActiveTab] = useState<'distribusi' | 'riwayat' | 'profil'>('distribusi')
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

  const schoolOptions = panel?.options.sekolah ?? []

  const addBahanBakuRow = () => {
    setBahanBakuRows((prev) => [...prev, emptyBahanBakuRow()])
  }

  const removeBahanBakuRow = (id: string) => {
    setBahanBakuRows((prev) => prev.filter((row) => row.id !== id))
  }

  const updateBahanBakuRow = (id: string, field: 'nama' | 'jumlah', value: string) => {
    setBahanBakuRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  const resetDistributionForm = () => {
    setReportForm(emptyReportForm())
    setMenuForm(emptyMenuForm())
    setBahanBakuRows([emptyBahanBakuRow()])
    setSchoolAllocationForm(emptySchoolAllocationForm())
    setDistribusiPhoto({ menu: null })
  }

  const toggleSchoolAllocation = (schoolId: number, checked: boolean) => {
    setSchoolAllocationForm((prev) => {
      if (!checked) {
        const next = { ...prev }
        delete next[String(schoolId)]
        return next
      }

      return {
        ...prev,
        [String(schoolId)]: prev[String(schoolId)] ?? { porsi: '', catatan: '' },
      }
    })
  }

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
      const selectedSchools = Object.entries(schoolAllocationForm)
        .map(([sekolahId, data]) => ({
          sekolah_id: sekolahId,
          porsi_distribusi: String(data?.porsi ?? '').trim(),
          keterangan: String(data?.catatan ?? '').trim(),
        }))
      const missingPorsiSchool = selectedSchools.find((item) => item.porsi_distribusi === '')

      if (!reportForm.tanggal) {
        setSavingReport(false)
        setError('Tanggal wajib diisi.')
        return
      }

      if (!menuForm.deskripsi?.trim()) {
        setSavingReport(false)
        setError('Deskripsi menu wajib diisi.')
        return
      }

      if (missingPorsiSchool) {
        setSavingReport(false)
        setError('Isi porsi untuk semua sekolah yang dicentang.')
        return
      }

      if (selectedSchools.length === 0) {
        setSavingReport(false)
        setError('Pilih minimal satu sekolah dan isi porsi distribusinya.')
        return
      }

      const formData = new FormData()
      formData.append('tanggal', reportForm.tanggal || '')
      formData.append('menu[deskripsi]', menuForm.deskripsi || '')
      formData.append('menu[kalori]', menuForm.kalori || '')
      formData.append('menu[protein]', menuForm.protein || '')
      formData.append('menu[karbohidrat]', menuForm.karbohidrat || '')
      formData.append('menu[lemak]', menuForm.lemak || '')
      formData.append('menu[jumlah]', menuForm.jumlah || '')
      // Bahan baku manual rows
      bahanBakuRows
        .filter((row) => row.nama.trim() !== '')
        .forEach((row, index) => {
          formData.append(`bahan_baku[${index}][nama]`, row.nama.trim())
          formData.append(`bahan_baku[${index}][jumlah]`, row.jumlah.trim())
        })
      selectedSchools.forEach((item, index) => {
        formData.append(`distributions[${index}][sekolah_id]`, item.sekolah_id)
        formData.append(`distributions[${index}][porsi_distribusi]`, item.porsi_distribusi)
        formData.append(`distributions[${index}][keterangan]`, item.keterangan)
      })

      if (distribusiPhoto.menu) {
        formData.append('foto_menu', distribusiPhoto.menu)
      }

      const response = await apiRequest<{ message: string }>('/panel/distribution', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      setMessage(response.message)
      resetDistributionForm()
      await loadPanel()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menyimpan laporan distribusi.')
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

        {message && <div className="role-panel-alert success">{message}</div>}
        {error && <div className="role-panel-alert error">{error}</div>}

        <section className="role-panel-tabs" aria-label="Navigasi modul panel">
          {[
            { key: 'distribusi', label: 'Input Distribusi' },
            { key: 'riwayat', label: 'Riwayat Distribusi' },
            { key: 'profil', label: 'Profil SPPG' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`role-panel-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key as 'distribusi' | 'riwayat' | 'profil')}
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
                  <p>Isi menu sekali, lalu centang sekolah yang menerima dan tentukan porsi masing-masing.</p>
                </div>
              </header>

              <form className="role-panel-form" onSubmit={handleReportSubmit}>
                <input type="hidden" value={reportForm.tanggal ?? getLocalDateString()} readOnly />
                <div className="role-panel-inline-card role-panel-full">
                  <h3>Data Menu</h3>
                  <p>Menu dicatat langsung saat distribusi, jadi tidak perlu buka halaman terpisah.</p>
                  <div className="role-panel-inline-grid">
                    <div className="role-panel-inline-section role-panel-inline-span-2">
                      <h4>Bahan Baku</h4>
                      <p>Tambahkan bahan baku yang digunakan. Klik tombol di bawah untuk menambah baris baru.</p>

                      <div className="role-panel-bahan-rows">
                        {bahanBakuRows.map((row, index) => (
                          <div key={row.id} className="role-panel-bahan-row">
                            <span className="role-panel-bahan-row-num">{index + 1}</span>
                            <label className="role-panel-bahan-row-label">
                              Nama Bahan
                              <input
                                type="text"
                                value={row.nama}
                                onChange={(event) => updateBahanBakuRow(row.id, 'nama', event.target.value)}
                                placeholder="Contoh: Beras, Ayam, Tahu"
                              />
                            </label>
                            <label className="role-panel-bahan-row-label">
                              Jumlah
                              <input
                                type="text"
                                value={row.jumlah}
                                onChange={(event) => updateBahanBakuRow(row.id, 'jumlah', event.target.value)}
                                placeholder="Contoh: 5 kg"
                              />
                            </label>
                            {bahanBakuRows.length > 1 && (
                              <button
                                type="button"
                                className="role-panel-bahan-remove"
                                onClick={() => removeBahanBakuRow(row.id)}
                                title="Hapus bahan baku ini"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="role-panel-bahan-add"
                        onClick={addBahanBakuRow}
                      >
                        + Tambah Bahan Baku
                      </button>
                    </div>
                    <label className="role-panel-inline-span-2">
                      Deskripsi Menu
                      <textarea value={menuForm.deskripsi ?? ''} onChange={(event) => setMenuForm((prev) => ({ ...prev, deskripsi: event.target.value }))} placeholder="Keterangan menu" required />
                    </label>
                    <label>
                      Jumlah Porsi
                      <input
                        type="number"
                        min="1"
                        value={menuForm.jumlah ?? ''}
                        onChange={(event) => setMenuForm((prev) => ({ ...prev, jumlah: event.target.value }))}
                        placeholder="Contoh: 120"
                      />
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
                    <label className="role-panel-inline-span-2">
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
                  </div>
                </div>

                <div className="role-panel-inline-card role-panel-full">
                  <h3>Sekolah Tujuan</h3>
                  <p>Centang sekolah yang menerima distribusi, lalu isi porsi untuk masing-masing sekolah.</p>
                  <div className="role-panel-school-list">
                    {schoolOptions.length === 0 ? (
                      <div className="role-panel-empty role-panel-school-empty">Belum ada sekolah yang terhubung ke akun ini.</div>
                    ) : schoolOptions.map((school) => {
                      const isSelected = Object.prototype.hasOwnProperty.call(schoolAllocationForm, String(school.id))

                      return (
                        <label key={school.id} className={`role-panel-school-item ${isSelected ? 'selected' : ''}`}>
                          <div className="role-panel-school-meta">
                            <input type="checkbox" checked={isSelected} onChange={(event) => toggleSchoolAllocation(school.id, event.target.checked)} />
                            <span>
                              <strong>{school.nama_sekolah}</strong>
                              <small>{school.jenis_sekolah ?? 'Sekolah'}</small>
                            </span>
                          </div>
                              <div className="role-panel-school-porsi-and-note">
                                <div className="role-panel-school-porsi">
                                  <span>Porsi</span>
                                  <input
                                    type="number"
                                    min="1"
                                    disabled={!isSelected}
                                    value={schoolAllocationForm[String(school.id)]?.porsi ?? ''}
                                    onChange={(event) => setSchoolAllocationForm((prev) => ({ ...prev, [String(school.id)]: { ...(prev[String(school.id)] ?? { porsi: '', catatan: '' }), porsi: event.target.value } }))}
                                    placeholder="Jumlah porsi"
                                  />
                                </div>

                                <div className="role-panel-school-note">
                                  <span>Catatan</span>
                                  <textarea
                                    disabled={!isSelected}
                                    value={schoolAllocationForm[String(school.id)]?.catatan ?? ''}
                                    onChange={(event) => setSchoolAllocationForm((prev) => ({ ...prev, [String(school.id)]: { ...(prev[String(school.id)] ?? { porsi: '', catatan: '' }), catatan: event.target.value } }))}
                                    placeholder="Catatan per sekolah (opsional)"
                                  />
                                </div>
                              </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <button type="submit" className="role-panel-button" disabled={savingReport}>
                  {savingReport ? 'Menyimpan...' : 'Simpan Distribusi'}
                </button>
              </form>
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
