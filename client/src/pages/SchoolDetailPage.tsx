import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { apiRequest, type ApiDetailResponse, type SchoolDetail } from '../config/api'
import '../styles/SchoolDetailPage.css'

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

export default function SchoolDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<'info' | 'distribusi' | 'laporan'>('info')
  const [searchMenu, setSearchMenu] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue())
  const [reportDate, setReportDate] = useState(getTodayInputValue())
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

  const formattedAddress = useMemo(() => {
    return school ? formatStreetAddress(school.alamat) : '-'
  }, [school])

  const clearFilter = () => {
    setSearchMenu('')
    setSelectedDate('')
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

            <section className="summary-card summary-card-sppg" aria-label="Dapur penyedia">
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
                        {filteredDistribusi.map((item) => (
                          <article key={item.id} className="distribution-card">
                            <div className="distribution-card-top">
                              <h4>{item.menu}</h4>
                              <span>{item.tanggal}</span>
                            </div>
                            <div className="distribution-card-meta">
                              <span>{item.porsi} porsi</span>
                              <span>Jam {item.jam}</span>
                            </div>
                          </article>
                        ))}
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

                    {school.reports.length > 0 ? (
                      <div className="distribution-list">
                        {school.reports.map((report) => (
                          <article key={report.id} className="distribution-card">
                            <div className="distribution-card-top">
                              <h4>{report.tanggal}</h4>
                              <span>{report.keterangan ?? 'Laporan sekolah'}</span>
                            </div>
                            <div className="distribution-card-meta">
                              <span>Penerima: {report.jumlahPenerima}</span>
                              <span>Dikonsumsi: {report.jumlahDikonsumsi}</span>
                              <span>Sisa: {report.sisa}</span>
                            </div>
                          </article>
                        ))}
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
