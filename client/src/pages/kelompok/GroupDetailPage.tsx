import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { apiRequest, type ApiDetailResponse, type GroupDetail } from '../../config/api'
import '../../styles/GroupDetailPage.css'

export default function GroupDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('info')
  const [detail, setDetail] = useState<GroupDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setError('ID kelompok tidak ditemukan.')
      setLoading(false)
      return
    }

    setLoading(true)
    apiRequest<ApiDetailResponse<GroupDetail>>(`/groups/${id}`)
      .then((response) => setDetail(response.data))
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Detail kelompok gagal dimuat.')
      })
      .finally(() => setLoading(false))
  }, [id])

  return (
    <>
      <Header />
      <div className="group-detail-page">
        <button className="back-btn" onClick={() => navigate('/kelompok')}>← Kembali</button>

        {loading && <div className="detail-container"><p>Memuat detail kelompok...</p></div>}
        {error && !loading && <div className="detail-container"><p>{error}</p></div>}

        {detail && !loading && !error && (
          <>
            <div className="detail-header" style={{ backgroundColor: detail.color }}>
              <div className="header-content">
                <div className="header-icon">{detail.icon}</div>
                <div className="header-info">
                  <h1>{detail.name}</h1>
                  <p className="group-subtitle">{detail.subtitle}</p>
                  <p className="group-description">{detail.description}</p>
                </div>
                <div className="header-badge">
                  <span className="badge-category">{detail.jenis}</span>
                </div>
              </div>
            </div>

            <div className="detail-container">
              <div className="info-cards">
                <div className="info-card">
                  <div className="card-content">
                    <h3 className="card-label">Jenis</h3>
                    <p className="card-value">{detail.infoDetail.jenis}</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="card-content">
                    <h3 className="card-label">Status Program</h3>
                    <p className="card-value status-aktif">{detail.statusProgram}</p>
                  </div>
                </div>
              </div>

              <div className="sppg-section">
                <div className="section-title">
                  <h2>Dapur Penyedia (SPPG)</h2>
                  <span className="sppg-count">{detail.sppg.jumlah}</span>
                </div>
                <div className="sppg-card">
                  <div className="sppg-header">
                    <h3>{detail.sppg.name}</h3>
                  </div>
                  <div className="sppg-body">
                    <div className="sppg-info">
                      <p><strong>Porsi:</strong> {detail.sppg.porsi}</p>
                      <p><strong>Status:</strong> <span className="status-badge">{detail.sppg.status}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tabs-section">
                <div className="tabs-header">
                  <button className={`tab-button ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Informasi Kelompok</button>
                  <button className={`tab-button ${activeTab === 'sppg' ? 'active' : ''}`} onClick={() => setActiveTab('sppg')}>Detail SPPG</button>
                  <button className={`tab-button ${activeTab === 'distribusi' ? 'active' : ''}`} onClick={() => setActiveTab('distribusi')}>Distribusi Porsi</button>
                </div>

                <div className="tabs-content">
                  {activeTab === 'info' && (
                    <div className="tab-pane">
                      <h3>Informasi Kelompok</h3>
                      <div className="info-list">
                        <div className="info-row"><span className="label">Jenis Kelompok</span><span className="value">{detail.infoDetail.jenis}</span></div>
                        <div className="info-row"><span className="label">Nomor Registrasi</span><span className="value">{detail.infoDetail.nomorReg}</span></div>
                        <div className="info-row"><span className="label">Lokasi</span><span className="value">{detail.infoDetail.lokasi}</span></div>
                        <div className="info-row"><span className="label">Jumlah Anggota</span><span className="value">{detail.infoDetail.jumlahAnggota} orang</span></div>
                        <div className="info-row"><span className="label">Status Program</span><span className="value status-green">{detail.infoDetail.statusProgram}</span></div>
                        <div className="info-row"><span className="label">Tanggal Bergabung</span><span className="value">{detail.infoDetail.tanggalBergabung ?? '-'}</span></div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'sppg' && (
                    <div className="tab-pane">
                      <h3>Detail Dapur Penyedia (SPPG)</h3>
                      {detail.sppgDetail.map((sppg) => (
                        <div key={sppg.id} className="detail-card">
                          <div className="detail-header-card">
                            <h4>{sppg.nama}</h4>
                            <span className="status-badge">{sppg.status}</span>
                          </div>
                          <div className="detail-body-card">
                            <div className="detail-info">
                              <p><strong>Lokasi:</strong> {sppg.lokasi}</p>
                              <p><strong>Kapasitas Porsi:</strong> {sppg.porsi}</p>
                              <p><strong>Penanggung Jawab:</strong> {sppg.penanggungjawab}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'distribusi' && (
                    <div className="tab-pane">
                      <h3>Jadwal Distribusi Porsi</h3>
                      <div className="table-container">
                        <table className="detail-table">
                          <thead>
                            <tr>
                              <th>Hari</th>
                              <th>Waktu</th>
                              <th>Menu</th>
                              <th>Jumlah</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.distribusiDetail.map((dist, idx) => (
                              <tr key={idx}>
                                <td>{dist.hari}</td>
                                <td>{dist.waktu}</td>
                                <td>{dist.menu}</td>
                                <td>{dist.jumlah}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  )
}
