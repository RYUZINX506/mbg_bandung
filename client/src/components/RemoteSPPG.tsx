import { useState } from 'react'
import '../styles/RemoteSPPG.css'

export default function RemoteSPPG() {
  const [showMore, setShowMore] = useState(false)

  const remoteSPPG = [
    { id: 1, kecamatan: 'Surian Tanjung', lokasi: 'Suriamukti, Wanajaya' },
    { id: 2, kecamatan: 'Cisitu Cimarga', lokasi: 'Cikeusi Cinangsi' },
    { id: 3, kecamatan: 'Situraja', lokasi: 'Bangbayang, Cicarimanah' },
    { id: 4, kecamatan: 'Cibugel Cipasang', lokasi: 'Tamansari' },
    { id: 5, kecamatan: 'Tanjungmedar', lokasi: 'Kamal, Kertamukti, Cisangge' },
    { id: 6, kecamatan: 'Buahdua', lokasi: 'Ciawitali, Karangbungur' }
  ]

  const displayedSPPG = showMore ? remoteSPPG : remoteSPPG.slice(0, 3)

  return (
    <section id="sppg-terpencil" className="remote-sppg">
      <div className="section-shell">
        <div className="section-card">
          <div className="section-header">
            <h2>SPPG Terpencil</h2>
            <p>Program khusus untuk wilayah terpencil di Kota Bandung yang memerlukan perhatian lebih</p>
          </div>

          <div className="sppg-content">
            <div className="sppg-stats">
              <div className="stat-box">
                <div className="stat-value">28</div>
                <div className="stat-label">Total SPPG</div>
              </div>
              <div className="stat-box completed">
                <div className="stat-value">28</div>
                <div className="stat-label">Selesai Pembangunan</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">0</div>
                <div className="stat-label">Proses Pembangunan</div>
              </div>
            </div>

            <div className="progress-section">
              <h3>Progress Pembangunan</h3>
              <div className="progress-info">
                <span className="percentage">100% (28/28)</span>
              </div>
              <div className="progress-bar-large">
                <div className="progress-fill" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="sppg-grid">
              <div className="sppg-map">
                <h4>Sebaran Lokasi SPPG Terpencil</h4>
                <div className="map-placeholder">
                  <img src="https://via.placeholder.com/500x400" alt="Peta Sebaran" />
                  <p>15 kecamatan dengan total 28 lokasi SPPG</p>
                </div>
              </div>

              <div className="sppg-list">
                <h4>Daftar Kecamatan</h4>
                <ul className="kecamatan-list">
                  {displayedSPPG.map(item => (
                    <li key={item.id}>
                      <span className="number">{item.id}</span>
                      <div className="location-info">
                        <strong>{item.kecamatan}</strong>
                        <small>{item.lokasi}</small>
                      </div>
                    </li>
                  ))}
                </ul>
                {!showMore && remoteSPPG.length > 3 && (
                  <button 
                    className="btn-more"
                    onClick={() => setShowMore(true)}
                  >
                    Muat Lebih Banyak
                  </button>
                )}
                {showMore && (
                  <button 
                    className="btn-more"
                    onClick={() => setShowMore(false)}
                  >
                    Tampilkan Lebih Sedikit
                  </button>
                )}
              </div>
            </div>

            <div className="sppg-targets">
              <h3>Target Pembangunan</h3>
              <div className="targets-grid">
                <div className="target-item">
                  <div className="target-icon">👥</div>
                  <p className="target-label">Maksimal 1.000 penerima manfaat</p>
                  <p className="target-desc">Target penerima manfaat per SPPG</p>
                </div>
                <div className="target-item">
                  <div className="target-icon">📅</div>
                  <p className="target-label">Maksimal pembangunan 35 hari</p>
                  <p className="target-desc">Target waktu penyelesaian pembangunan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
