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

  const normalized = value.startsWith('/') ? value : `/${value}`
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'

  return `${origin}${normalized}`
}

function renderImageOrFallback(url: string | null, alt: string, fallbackText: string) {
  if (!url) {
    return (
      <div className="photo-empty">
        <strong>{fallbackText}</strong>
        <p>Foto belum tersedia untuk bagian ini.</p>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={(event) => {
        const target = event.currentTarget
        target.style.display = 'none'
        const wrapper = target.parentElement
        if (wrapper) {
          wrapper.innerHTML = `<div class="photo-empty"><strong>${fallbackText}</strong><p>Foto tidak dapat dimuat.</p></div>`
        }
      }}
    />
  )
}

function formatCoordinate(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return '-'
  }

  return value.toFixed(6)
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
  const mapEmbedUrl = detail?.location.mapUrl ?? null
  const mapLink = detail?.location.mapsLink ?? null
  const coordinateLabel = detail
    ? `${formatCoordinate(detail.location.latitude)}, ${formatCoordinate(detail.location.longitude)}`
    : '-'

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
            <section className="sppg-hero-card">
              <div className="sppg-hero-copy">
                <p className="sppg-hero-eyebrow">Makan Bergizi Gratis</p>
                <h1>{detail.name}</h1>
                <p className="sppg-hero-address">{detail.address}</p>
                <div className="sppg-hero-meta">
                  <span>{detail.location.district}</span>
                  <span>{detail.status}</span>
                  <span>{detail.servedSchools.length} sekolah dilayani</span>
                </div>
              </div>
              <div className="sppg-hero-actions">
                <button type="button" className="sppg-hero-button ghost" onClick={() => navigate('/sppg')}>
                  Kembali ke daftar SPPG
                </button>
                <a
                  className="sppg-hero-button"
                  href={mapLink ?? `https://www.openstreetmap.org/search?query=${encodeURIComponent(detail.address)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Buka peta
                </a>
              </div>
            </section>

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
                <div className="sppg-stats-grid sppg-summary-grid">
                  {detail.stats.map(item => (
                    <div key={item.label} className="sppg-stat-card">
                      <div className="stat-label">{item.label}</div>
                      <div className="stat-value">{item.value}</div>
                      <div className="stat-sub">{item.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="sppg-info-grid">
                  <div className="sppg-section sppg-info-map">
                    <div className="section-head">
                      <h2>Lokasi Dapur</h2>
                      <span className="badge-count">Peta</span>
                    </div>
                    <div className="map-card sppg-map-card">
                      {mapEmbedUrl ? (
                        <iframe
                          className="sppg-map-frame"
                          title={`Peta lokasi ${detail.name}`}
                          src={mapEmbedUrl}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      ) : (
                        <div className="map-placeholder">
                          <div className="map-icon" aria-hidden="true">⌖</div>
                          <strong>Koordinat tidak tersedia</strong>
                          <p>Lokasi dapur belum memiliki titik peta yang valid.</p>
                        </div>
                      )}
                      <div className="sppg-map-footer">
                        <div>
                          <div className="sppg-map-label">Koordinat</div>
                          <div className="sppg-map-value">{coordinateLabel}</div>
                          <div className="contact-meta">{detail.location.address}</div>
                        </div>
                        <a className="map-action" href={mapLink ?? `https://www.openstreetmap.org/search?query=${encodeURIComponent(detail.address)}`} target="_blank" rel="noreferrer">
                          Buka peta
                        </a>
                      </div>
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
                    <h2>Informasi Kontak</h2>
                    <div className="contact-grid">
                      <div className="contact-card">
                        <div className="contact-head">
                          <div className="contact-title">Pengelola</div>
                          <span className="contact-tag">SPPG</span>
                        </div>
                        <div className="contact-value">{detail.contact.name}</div>
                        <div className="contact-meta">Penanggung jawab operasional dapur.</div>
                      </div>
                      <div className="contact-card">
                        <div className="contact-head">
                          <div className="contact-title">Telepon</div>
                          <span className="contact-tag">Aktif</span>
                        </div>
                        {detail.contact.phone !== '-' ? (
                          <a href={`tel:${detail.contact.phone}`} className="contact-value link">{detail.contact.phone}</a>
                        ) : (
                          <div className="contact-value">-</div>
                        )}
                      </div>
                      <div className="contact-card">
                        <div className="contact-head">
                          <div className="contact-title">Email</div>
                          <span className="contact-tag">Aktif</span>
                        </div>
                        {detail.contact.email !== '-' ? (
                          <a href={`mailto:${detail.contact.email}`} className="contact-value link">{detail.contact.email}</a>
                        ) : (
                          <div className="contact-value">-</div>
                        )}
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
                        <span className="download-btn disabled">Dokumen</span>
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
                      <div className="certificate-note">Data sertifikat akan tampil ketika dokumen sudah diunggah.</div>
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

                  <div className="sppg-section sppg-info-photo">
                    <h2>Foto Dapur</h2>
                    <div className="photo-card">
                      {renderImageOrFallback(
                        resolveImageUrl((detail as any).photos?.[0] ?? (detail as any).photoUrl ?? null),
                        'Tampak dapur',
                        'Tidak ada foto dapur tersedia'
                      )}
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
                                    {renderImageOrFallback(resolveImageUrl(item.fotoMenuUrl ?? null), `Foto menu ${item.sekolah}`, 'Foto menu belum diinput')}
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
