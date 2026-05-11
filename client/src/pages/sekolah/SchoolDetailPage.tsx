import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { apiRequest, type ApiDetailResponse, type SchoolDetail } from '../../config/api'
import '../../styles/SchoolDetailPage.css'

function getTodayInputValue() {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10)
}

const fullDateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Jakarta',
})

function formatStreetAddress(address: string) {
  const trimmedAddress = address.trim()

  if (!trimmedAddress) {
    return '-'
  }

  if (/^jln?\.?\s/i.test(trimmedAddress)) {
    return trimmedAddress.replace(/^jln?\.?\s*/i, 'Jln. ')
  }

  return `Jln. ${trimmedAddress}`
}

function safeDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getDbDatePart(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) {
    return null
  }

  return {
    year: match[1],
    month: match[2],
    day: match[3],
  }
}

function getDbTimePart(value: string) {
  const match = value.match(/(\d{2}):(\d{2})(?::\d{2})?/) 
  if (!match) {
    return null
  }

  return `${match[1]}.${match[2]}`
}

function formatReportDate(value: string) {
  const dbDatePart = getDbDatePart(value)
  if (!dbDatePart) {
    const date = safeDate(value)
    return date ? shortDateFormatter.format(date) : value
  }

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]

  const monthIndex = Number(dbDatePart.month) - 1
  const monthName = monthNames[monthIndex] ?? dbDatePart.month

  return `${Number(dbDatePart.day)} ${monthName} ${dbDatePart.year}`
}

function formatReportTime(value: string) {
  const dbTimePart = getDbTimePart(value)
  if (dbTimePart) {
    return dbTimePart
  }

  const date = safeDate(value)
  return date ? timeFormatter.format(date) : '-'
}

function getReportCreatedAt(report: { created_at?: string; createdAt?: string }) {
  return report.created_at ?? report.createdAt ?? ''
}

function resolveImageUrl(value: string | null | undefined) {
  if (!value) {
    return null
  }

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  return `http://127.0.0.1:8000${value.startsWith('/') ? value : `/${value}`}`
}

function formatDistribusiDate(value: string) {
  const date = safeDate(`${value}T00:00:00`)
  return date ? fullDateFormatter.format(date) : value
}

export default function SchoolDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'info' | 'distribusi' | 'laporan'>('info')
  const [searchMenu, setSearchMenu] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue())
  const [reportDate, setReportDate] = useState(getTodayInputValue())
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null)
  const [expandedDistribusiId, setExpandedDistribusiId] = useState<number | null>(null)
  const [school, setSchool] = useState<SchoolDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setError('ID sekolah tidak ditemukan.')
      setLoading(false)
      return
    }

    setLoading(true)
    apiRequest<ApiDetailResponse<SchoolDetail>>(`/schools/${id}`)
      .then((response) => {
        setSchool(response.data)
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Detail sekolah gagal dimuat.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  const filteredDistribusi = useMemo(() => {
    return (school?.distribusi ?? []).filter((item) => {
      const matchesSearch = item.menu.toLowerCase().includes(searchMenu.toLowerCase())
      const matchesDate = selectedDate ? item.tanggal === selectedDate : true
      return matchesSearch && matchesDate
    })
  }, [school?.distribusi, searchMenu, selectedDate])

  const reportDateLabel = useMemo(() => {
    const date = new Date(`${reportDate}T00:00:00`)
    return fullDateFormatter.format(date)
  }, [reportDate])

  const filteredReports = useMemo(() => {
    return (school?.reports ?? []).filter((report) => report.tanggal === reportDate)
  }, [school?.reports, reportDate])

  const formattedAddress = useMemo(() => {
    return school ? formatStreetAddress(school.alamat) : '-'
  }, [school])

  const clearFilter = () => {
    setSearchMenu('')
    setSelectedDate('')
  }

  const toggleReport = (reportId: number) => {
    setExpandedReportId((current) => (current === reportId ? null : reportId))
  }

  const toggleDistribusi = (distributionId: number) => {
    setExpandedDistribusiId((current) => (current === distributionId ? null : distributionId))
  }

  const openSppgDetail = () => {
    if (school?.sppg.id) {
      navigate(`/sppg/${school.sppg.id}`)
    }
  }

  return (
    <>
      <Header />
      <div className="school-detail-page">
        {loading && (
          <div className="school-detail-shell">
            <div className="empty-panel">
              <h4>Memuat detail sekolah...</h4>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="school-detail-shell">
            <div className="empty-panel">
              <h4>{error}</h4>
            </div>
          </div>
        )}

        {school && !loading && !error && (
          <div className="school-detail-shell">
            <section className="school-hero">
              <div className="hero-left">
                <div className="hero-headline">
                  <h1>{school.name}</h1>
                </div>
              </div>

              <div className="hero-right">
                <div className="hero-meta-box" aria-label="Tipe dan status sekolah">
                  <span className="hero-meta-type">{school.type}</span>
                  <span className="hero-meta-divider" aria-hidden="true" />
                  <span className="hero-meta-status">{school.status}</span>
                </div>
              </div>

              <p className="hero-address">{formattedAddress}</p>
            </section>

            <section className="school-summary-grid" aria-label="Ringkasan sekolah">
              <article className="summary-card summary-card-info summary-card-blue">
                <div className="summary-card-content">
                  <h3>Jumlah Siswa</h3>
                  <p>{school.jumlahSiswa}</p>
                  <span>siswa terdaftar</span>
                </div>
              </article>

              <article className="summary-card summary-card-info summary-card-purple">
                <div className="summary-card-content">
                  <h3>Kecamatan</h3>
                  <p>{school.kecamatan}</p>
                  <span>wilayah sekolah</span>
                </div>
              </article>
            </section>

            <section
              className={`summary-card summary-card-sppg ${school.sppg.id ? 'summary-card-sppg-clickable' : ''}`}
              aria-label="Dapur penyedia"
              role={school.sppg.id ? 'button' : undefined}
              tabIndex={school.sppg.id ? 0 : undefined}
              onClick={openSppgDetail}
              onKeyDown={(event) => {
                if (!school.sppg.id) {
                  return
                }

                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openSppgDetail()
                }
              }}
            >
              <div className="summary-sppg-body">
                <div className="summary-sppg-info">
                  <h4>{school.sppg.name}</h4>
                  <div className="sppg-tags">
                    <span className="sppg-tag sppg-tag-type">{school.sppg.jenis}</span>
                    <span className="sppg-tag sppg-tag-capacity">{school.sppg.kapasitas} porsi/hari</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="school-tabs-wrap" aria-label="Detail sekolah">
              <div className="school-tabs" role="tablist" aria-label="Detail sekolah tab">
                <button type="button" role="tab" aria-selected={activeTab === 'info'} className={`school-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                  Informasi Sekolah
                </button>
                <button type="button" role="tab" aria-selected={activeTab === 'distribusi'} className={`school-tab ${activeTab === 'distribusi' ? 'active' : ''}`} onClick={() => setActiveTab('distribusi')}>
                  Distribusi Porsi
                </button>
                <button type="button" role="tab" aria-selected={activeTab === 'laporan'} className={`school-tab ${activeTab === 'laporan' ? 'active' : ''}`} onClick={() => setActiveTab('laporan')}>
                  Laporan Sekolah
                </button>
              </div>

              <div className="school-tab-content">
                {activeTab === 'info' && (
                  <div className="tab-panel" role="tabpanel">
                    <section className="panel-card panel-card-blue">
                      <header className="panel-title-row">
                        <h3>Informasi Kontak</h3>
                      </header>
                      <div className="panel-subcard">
                        <div>
                          <h4>Alamat Lengkap</h4>
                          <p>{school.alamat}</p>
                        </div>
                      </div>
                    </section>

                    <section className="panel-card panel-card-purple">
                      <header className="panel-title-row">
                        <h3>Status Program</h3>
                      </header>
                      <div className="panel-subcard">
                        <div>
                          <h4>Program Makan Bergizi Gratis</h4>
                          <p>Aktif sejak {school.programStart ?? '-'}</p>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'distribusi' && (
                  <div className="tab-panel" role="tabpanel">
                    <section className="panel-card panel-card-blue panel-title-only">
                      <h3>Data Distribusi</h3>
                      <p>Riwayat distribusi makanan ke sekolah ini</p>
                    </section>

                    <section className="panel-filter-box">
                      <div className="filter-item">
                        <label htmlFor="menuSearch">Cari Menu</label>
                        <input id="menuSearch" type="text" placeholder="Masukkan nama menu..." value={searchMenu} onChange={(event) => setSearchMenu(event.target.value)} />
                      </div>

                      <div className="filter-item">
                        <label htmlFor="dateFilter">Filter Tanggal</label>
                        <input id="dateFilter" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
                      </div>
                    </section>

                    <p className="distribution-count">
                      Menampilkan <strong>{filteredDistribusi.length}</strong> dari <strong>{school.distribusi.length}</strong> distribusi
                    </p>

                    {filteredDistribusi.length === 0 ? (
                      <div className="empty-panel">
                        <h4>Tidak Ada Data Distribusi</h4>
                        <p>Tidak ditemukan distribusi yang sesuai dengan filter yang dipilih.</p>
                        <button type="button" onClick={clearFilter}>Hapus Filter</button>
                      </div>
                    ) : (
                      <div className="distribution-list">
                        {filteredDistribusi.map((item) => {
                          const isExpanded = expandedDistribusiId === item.id

                          return (
                            <article key={item.id} className={`distribution-card ${isExpanded ? 'is-expanded' : ''}`}>
                              <button
                                type="button"
                                className="distribution-head distribution-head-trigger"
                                onClick={() => toggleDistribusi(item.id)}
                                aria-expanded={isExpanded}
                                aria-label={`Buka detail distribusi ${school.name} tanggal ${item.tanggal}`}
                              >
                                <div className="distribution-head-main">
                                  <div className="distribution-head-icon" aria-hidden="true">SD</div>
                                  <div>
                                    <h4>{school.name}</h4>
                                    <div className="distribution-head-tags">
                                      <span className="distribution-tag distribution-tag-type">{school.type}</span>
                                      <span>{formatDistribusiDate(item.tanggal)}</span>
                                      <span className="distribution-tag distribution-tag-porsi">{item.porsi} porsi</span>
                                    </div>
                                  </div>
                                </div>
                                <span className={`distribution-expand ${isExpanded ? 'is-open' : ''}`} aria-hidden="true">
                                  {isExpanded ? '⌄' : '⌃'}
                                </span>
                              </button>

                              {isExpanded && (
                                <div className="distribution-body">
                                  <div className="distribution-school-card">
                                    <div className="distribution-school-title">
                                      <div className="distribution-school-icon" aria-hidden="true">SD</div>
                                      <div>
                                        <h5>{school.name}</h5>
                                        <p>{formattedAddress}</p>
                                      </div>
                                    </div>
                                    <div className="distribution-school-meta">
                                      <span>Sekolah {school.type}</span>
                                      <span>{formatDistribusiDate(item.tanggal)}</span>
                                    </div>
                                  </div>

                                  <div className="distribution-menu-card">
                                    <div className="distribution-menu-title-row">
                                      <div className="distribution-menu-icon" aria-hidden="true">MN</div>
                                      <h5>Menu</h5>
                                    </div>
                                    <div className="distribution-menu-content">
                                      <div className="distribution-menu-photo" aria-label="Preview menu">
                                        <div>
                                          <span>Foto Menu</span>
                                          <strong>Tidak tersedia</strong>
                                        </div>
                                      </div>
                                      <div className="distribution-menu-details">
                                        <h6>{item.menu}</h6>
                                        <div className="distribution-nutrition-box">
                                          <p>Ringkasan Nutrisi</p>
                                          <div className="distribution-nutrition-grid">
                                            <div>
                                              <span>Total Kalori</span>
                                              <strong>-</strong>
                                            </div>
                                            <div>
                                              <span>Total Protein</span>
                                              <strong>0g</strong>
                                            </div>
                                            <div>
                                              <span>Total Karbo</span>
                                              <strong>0g</strong>
                                            </div>
                                            <div>
                                              <span>Total Lemak</span>
                                              <strong>0g</strong>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="distribution-note-card">
                                    <h6>Catatan:</h6>
                                    <p>Belum ada catatan distribusi untuk menu ini. Waktu distribusi tercatat pada jam {item.jam}.</p>
                                  </div>
                                </div>
                              )}
                            </article>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'laporan' && (
                  <div className="tab-panel" role="tabpanel">
                    <section className="panel-card panel-card-blue panel-report-head">
                      <header className="panel-title-row">
                        <div>
                          <h3>Riwayat Laporan Sekolah</h3>
                          <p>Laporan harian yang sudah diupload oleh sekolah ini</p>
                        </div>
                      </header>
                      <label className="report-date-filter" htmlFor="reportDate">
                        <input id="reportDate" type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} />
                      </label>
                    </section>

                    {filteredReports.length > 0 ? (
                      <div className="school-report-list">
                        {filteredReports.map((report) => {
                          const isExpanded = expandedReportId === report.id
                          const reportCreatedAt = getReportCreatedAt(report)
                          const menuUrl = resolveImageUrl(report.fotoMenuUrl ?? (report as any).foto_menu_url ?? null)
                          const siswaUrl = resolveImageUrl(report.fotoSiswaUrl ?? (report as any).foto_siswa_url ?? (report as any).foto_siswa_makan_url ?? null)

                          return (
                            <article key={report.id} className={`school-report-card ${isExpanded ? 'is-expanded' : ''}`}>
                              <button
                                type="button"
                                className="school-report-card-head school-report-card-trigger"
                                onClick={() => toggleReport(report.id)}
                                aria-expanded={isExpanded}
                                aria-label={`Buka detail laporan ${formatReportDate(report.tanggal)}`}
                              >
                                <div className="school-report-headline">
                                  <span className="school-report-icon">LF</span>
                                  <div>
                                    <h4>Laporan {formatReportDate(report.tanggal)}</h4>
                                    <div className="school-report-head-meta">
                                      <span className="school-report-time-chip">⏰ {formatReportTime(reportCreatedAt)}</span>
                                      <span className="school-report-status-chip">Terverifikasi</span>
                                    </div>
                                  </div>
                                </div>
                                <span className={`school-report-collapse ${isExpanded ? 'is-open' : ''}`} aria-hidden="true">
                                  {isExpanded ? '⌄' : '⌃'}
                                </span>
                              </button>

                              {isExpanded && (
                                <div className="school-report-expanded-body">
                                  <div className="school-report-detail-grid">
                                    <div className="school-report-detail-box">
                                      <div className="school-report-detail-icon is-green">WT</div>
                                      <div>
                                        <h5>Waktu Laporan</h5>
                                        <p><strong>Tanggal:</strong> {formatReportDate(report.tanggal)}</p>
                                        <p><strong>Waktu Upload:</strong> {formatReportTime(reportCreatedAt)}</p>
                                        <p><strong>Waktu Perangkat:</strong> {formatReportTime(reportCreatedAt)}</p>
                                      </div>
                                    </div>

                                    <div className="school-report-detail-box">
                                      <div className="school-report-detail-icon is-purple">LK</div>
                                      <div>
                                        <h5>Lokasi Upload</h5>
                                        <p><strong>Koordinat:</strong> {report.lokasi.latitude !== null && report.lokasi.longitude !== null ? `${report.lokasi.latitude}, ${report.lokasi.longitude}` : '-'}</p>
                                        <p><strong>Akurasi:</strong> {report.lokasi.akurasi !== null ? `±${report.lokasi.akurasi}m` : '-'}</p>
                                        <p><strong>Lokasi:</strong> {report.lokasi.alamat}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="school-report-photos-head">
                                    <div className="panel-icon panel-icon-blue">LF</div>
                                    <h5>Foto Laporan</h5>
                                  </div>

                                  <div className="school-report-photos-grid">
                                    <div className="school-report-photo-card">
                                      <div className="school-report-photo-title">
                                        <span>Foto Menu</span>
                                      </div>
                                      {menuUrl ? (
                                        <img src={menuUrl} alt={`Foto menu laporan ${report.tanggal}`} />
                                      ) : (
                                        <div className="school-report-photo-empty">Tidak ada foto menu</div>
                                      )}
                                    </div>

                                    <div className="school-report-photo-card">
                                      <div className="school-report-photo-title">
                                        <span>Foto Siswa</span>
                                      </div>
                                      {siswaUrl ? (
                                        <img src={siswaUrl} alt={`Foto siswa laporan ${report.tanggal}`} />
                                      ) : (
                                        <div className="school-report-photo-empty">Tidak ada foto siswa</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </article>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="empty-panel empty-panel-report">
                        <h4>Tidak Ada Laporan</h4>
                        <p>Sekolah ini belum melaporkan pada tanggal {reportDateLabel}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
