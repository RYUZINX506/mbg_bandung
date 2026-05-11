import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { apiRequest, type ApiDetailResponse, type SppgDetail } from '../../config/api'
import '../../styles/SPPGDetailPage.css'

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const longDateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const numberFormatter = new Intl.NumberFormat('id-ID')

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
})

function safeDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatShortDate(value: string) {
  const date = safeDate(value)
  return date ? shortDateFormatter.format(date) : value
}

function formatTime(value: string) {
  const date = safeDate(value)
  return date ? timeFormatter.format(date) : '-'
}

function formatNutrient(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? numberFormatter.format(value) : '-'
}

function formatNutrientWithUnit(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? `${numberFormatter.format(value)}g` : '-'
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

function getTodayInputValue() {
  const now = new Date()
  const timezoneOffset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

export default function SPPGDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('info')
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue())
  const [expandedDistribusiId, setExpandedDistribusiId] = useState<number | null>(null)
  const [detail, setDetail] = useState<SppgDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) {
      setError('ID SPPG tidak ditemukan.')
      setLoading(false)
      return
    }

    setLoading(true)
    apiRequest<ApiDetailResponse<SppgDetail>>(`/sppg/${id}`)
      .then((response) => setDetail(response.data))
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Detail SPPG gagal dimuat.')
      })
      .finally(() => setLoading(false))
  }, [id])

  const filteredDistribusi = useMemo(() => {
    if (!detail) {
      return []
    }

    return detail.distribusi.filter((item) => item.tanggal === selectedDate)
  }, [detail, selectedDate])

  useEffect(() => {
    if (filteredDistribusi.length === 1) {
      setExpandedDistribusiId(filteredDistribusi[0].id)
      return
    }

    if (filteredDistribusi.length === 0) {
      setExpandedDistribusiId(null)
    }
  }, [filteredDistribusi])

  const showDateFilter = activeTab === 'distribusi'

  return (
    <>
      <Header />
      <div className="sppg-detail-page">
        {loading && (
          <div className="sppg-detail-empty">
            <h1>Memuat detail SPPG...</h1>
          </div>
        )}

        {error && !loading && (
          <div className="sppg-detail-empty">
            <h1>{error}</h1>
          </div>
        )}

        {detail && !loading && !error && (
          <div className="sppg-detail-shell">
            <div className="sppg-header-card">
              <div>
                <h1>{detail.name}</h1>
                <p>{detail.address}</p>
              </div>
              <span className="sppg-status">{detail.status}</span>
            </div>

            <div className="sppg-tabs">
              {['info', 'distribusi'].map(tab => (
                <button
                  key={tab}
                  className={`sppg-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'info' && 'Informasi SPPG'}
                  {tab === 'distribusi' && 'Distribusi'}
                </button>
              ))}
            </div>

            {showDateFilter && (
              <div className="sppg-date-filter-bar">
                <label className="sppg-date-filter" htmlFor="sppgDateFilter">
                  <span>Tanggal data</span>
                  <input
                    id="sppgDateFilter"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    aria-label="Tanggal data SPPG"
                  />
                </label>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="sppg-detail-content">
                <div className="sppg-stats-grid">
                  {detail.stats.map(item => (
                    <div key={item.label} className="sppg-stat-card">
                      <div className="stat-label">{item.label}</div>
                      <div className="stat-value">{item.value}</div>
                      <div className="stat-sub">{item.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="sppg-section">
                  <h2>Informasi Kontak</h2>
                  <div className="contact-grid">
                    <div className="contact-card">
                      <div className="contact-head">
                        <div className="contact-title">Telepon</div>
                        <span className="contact-tag">Aktif</span>
                      </div>
                      <a href={`tel:${detail.contact.phone}`} className="contact-value link">{detail.contact.phone}</a>
                    </div>
                    <div className="contact-card">
                      <div className="contact-head">
                        <div className="contact-title">Email</div>
                        <span className="contact-tag">Aktif</span>
                      </div>
                      <a href={`mailto:${detail.contact.email}`} className="contact-value link">{detail.contact.email}</a>
                    </div>
                  </div>
                </div>

                <div className="sppg-section">
                  <h2>Fasilitas Dapur</h2>
                  <div className="facility-card">
                    <div className="facility-list">
                      {detail.facilities.map(item => (
                        <span key={item} className="facility-pill">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sppg-section">
                  <h2>Foto Dapur</h2>
                  <div className="photo-card">
                    <img src={detail.photos[0]} alt="Tampak dapur" />
                  </div>
                </div>

                <div className="sppg-section">
                  <h2>Data Ahli Gizi</h2>
                  <div className="nutrition-card">
                    <div className="avatar"></div>
                    <div>
                      <div className="nutrition-name">{detail.nutritionist.name}</div>
                      <div className="nutrition-title">{detail.nutritionist.title}</div>
                      <div className="nutrition-org">{detail.nutritionist.org}</div>
                    </div>
                  </div>
                </div>

                <div className="sppg-section">
                  <h2>Sertifikat Laik Higiene Sanitasi (SLHS)</h2>
                  <div className="certificate-card">
                    <div className="certificate-header">
                      <div>
                        <div className="certificate-title">{detail.certificate.name}</div>
                        <div className="certificate-number">{detail.certificate.number}</div>
                      </div>
                      <button className="download-btn">Download</button>
                    </div>
                    <div className="certificate-dates">
                      <div>
                        <div className="date-label">Diterbitkan</div>
                        <div className="date-value">{detail.certificate.issued}</div>
                      </div>
                      <div>
                        <div className="date-label">Berlaku hingga</div>
                        <div className="date-value">{detail.certificate.validUntil}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sppg-section">
                  <div className="section-head">
                    <h2>Sekolah yang Dilayani</h2>
                    <span className="badge-count">{detail.servedSchools.length} Sekolah</span>
                  </div>
                  <div className="schools-list">
                    {detail.servedSchools.map(item => (
                      <div
                        key={item.id}
                        className="school-row clickable"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/sekolah/${item.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            navigate(`/sekolah/${item.id}`)
                          }
                        }}
                      >
                        <div>
                          <div className="school-name">{item.name}</div>
                          <div className="school-address">{item.address}</div>
                          <div className="school-level">{item.level}</div>
                        </div>
                        <span className="school-status">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'distribusi' && (
              <div className="sppg-detail-content">
                <div className="sppg-section">
                  <div className="section-head">
                    <h2>Distribusi Porsi</h2>
                    <span className="badge-count">{filteredDistribusi.length} dari {detail.distribusi.length} Distribusi</span>
                  </div>

                  <div className="sppg-distribution-list">
                    {filteredDistribusi.length > 0 ? filteredDistribusi.map((item) => (
                      <article
                        key={item.id}
                        className={`sppg-distribution-card ${expandedDistribusiId === item.id ? 'expanded' : ''}`}
                      >
                        <button
                          type="button"
                          className="sppg-distribution-summary clickable"
                          onClick={() => setExpandedDistribusiId(expandedDistribusiId === item.id ? null : item.id)}
                          aria-expanded={expandedDistribusiId === item.id}
                        >
                          <div className="sppg-distribution-summary-left">
                            <div className="sppg-distribution-summary-heading">
                              <div className="sppg-distribution-icon" aria-hidden="true">SD</div>
                              <div>
                                <h3>{item.sekolah}</h3>
                                <p>{item.level}</p>
                              </div>
                            </div>
                            <div className="sppg-distribution-meta-summary">
                              <span>{item.level}</span>
                              <span>{formatShortDate(item.tanggal)}</span>
                              <span>{formatTime(item.createdAt ?? item.tanggal)}</span>
                            </div>
                          </div>
                          <div className="sppg-distribution-summary-right">
                            <span className="sppg-distribution-pill">{item.porsi} porsi</span>
                            <span className={`sppg-distribution-chevron ${expandedDistribusiId === item.id ? 'open' : ''}`}>⌄</span>
                          </div>
                        </button>

                        {expandedDistribusiId === item.id && (
                          <div className="sppg-distribution-detail">
                            <div className="sppg-distribution-menu-card">
                              <div className="distribution-card-header">
                                <span className="distribution-card-icon">M</span>
                                <div>
                                  <div className="distribution-card-title">Menu</div>
                                  <div className="distribution-card-subtitle">Rincian makanan distribusi</div>
                                </div>
                              </div>
                              <div className="distribution-menu-layout">
                                <div className="distribution-menu-preview">
                                    {item.fotoMenuUrl ? <img src={resolveImageUrl(item.fotoMenuUrl) ?? undefined} alt={`Foto menu ${item.sekolah}`} /> : <div className="distribution-menu-placeholder">Foto menu belum diinput</div>}
                                </div>

                                <div className="distribution-menu-content">
                                  <h4>{item.menu}</h4>

                                  <div className="distribution-nutrition-panel">
                                    <div className="distribution-nutrition-panel-head">
                                      <strong>Ringkasan Nutrisi</strong>
                                    </div>
                                    <div className="distribution-nutrition-grid">
                                      <div className="distribution-nutrition-box tone-calorie">
                                        <span>Total Kalori</span>
                                        <strong>{formatNutrient(item.kalori)}</strong>
                                      </div>
                                      <div className="distribution-nutrition-box tone-protein">
                                        <span>Total Protein</span>
                                        <strong>{formatNutrientWithUnit(item.protein)}</strong>
                                      </div>
                                      <div className="distribution-nutrition-box tone-carb">
                                        <span>Total Karbo</span>
                                        <strong>{formatNutrientWithUnit(item.karbo)}</strong>
                                      </div>
                                      <div className="distribution-nutrition-box tone-fat">
                                        <span>Total Lemak</span>
                                        <strong>{formatNutrientWithUnit(item.lemak)}</strong>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="sppg-distribution-stats-grid">
                              <div className="distribution-stat-box">
                                <span>Porsi</span>
                                <strong>{item.porsi}</strong>
                              </div>
                              <div className="distribution-stat-box">
                                <span>Status</span>
                                <strong>{item.status}</strong>
                              </div>
                            </div>
                            <div className="sppg-distribution-note">
                              <strong>Catatan:</strong> Distribusi data untuk sekolah ini pada tanggal terpilih.
                            </div>
                          </div>
                        )}
                      </article>
                    )) : (
                      <div className="sppg-empty-block">Belum ada distribusi yang terhubung.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
