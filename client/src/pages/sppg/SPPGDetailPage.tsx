import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { apiRequest, type ApiDetailResponse, type SppgDetail } from '../../config/api'
import '../../styles/SPPGDetailPage.css'

export default function SPPGDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('info')
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
              {['info', 'distribusi', 'laporan'].map(tab => (
                <button
                  key={tab}
                  className={`sppg-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'info' && 'Informasi SPPG'}
                  {tab === 'distribusi' && 'Distribusi'}
                  {tab === 'laporan' && 'Laporan Sekolah'}
                </button>
              ))}
            </div>

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

            {activeTab !== 'info' && (
              <div className="sppg-placeholder">
                <h2>{activeTab === 'distribusi' ? 'Distribusi' : 'Laporan Sekolah'}</h2>
                <p>Konten sedang diambil dari backend dan akan ditampilkan di sini.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
