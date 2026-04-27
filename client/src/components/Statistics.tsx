import { useEffect, useState } from 'react'
import '../styles/Statistics.css'
import { apiRequest, type HomeResponse } from '../config/api'

export default function Statistics() {
  const [summary, setSummary] = useState<HomeResponse['data']['summary'] | null>(null)

  useEffect(() => {
    apiRequest<HomeResponse>('/home')
      .then((response) => {
        setSummary(response.data.summary)
      })
      .catch(() => {
        setSummary(null)
      })
  }, [])

  const stats = summary
    ? [
        {
          id: 1,
          label: 'Sekolah',
          theme: 'theme-sd',
          value: String(summary.sekolah),
          total: String(summary.sekolah + summary.sppg),
          percentage: 100,
          icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 11 12 6l9 5-9 5-9-5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M6 12.5V18h12v-5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          ),
          subtitle: 'Terdaftar di backend',
          subValue: String(summary.laporanSekolah),
          subTotal: 'laporan',
          subLabel: 'Laporan sekolah'
        },
        {
          id: 2,
          label: 'Kelompok',
          theme: 'theme-paud',
          value: String(summary.kelompok),
          total: String(summary.kelompok),
          percentage: 100,
          icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="8" cy="8" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="16" cy="8" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          ),
          subtitle: 'Terdaftar di backend',
          subValue: String(summary.pengaduan),
          subTotal: 'pengaduan',
          subLabel: 'Masuk'
        },
        {
          id: 3,
          label: 'SPPG',
          theme: 'theme-tk',
          value: String(summary.sppg),
          total: String(summary.sppg),
          percentage: 100,
          icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 20h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M6 20V9l6-4 6 4v11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          ),
          subtitle: 'Aktif di sistem',
          subValue: String(summary.sppg),
          subTotal: 'total',
          subLabel: 'Jumlah dapur'
        }
      ]
    : []

  const totalPenerimaHariIni = summary?.totalPenerimaHariIni ?? 0
  const totalTargetPenerima = summary?.totalTargetPenerima ?? 0
  const pencapaian = totalTargetPenerima > 0 ? (totalPenerimaHariIni / totalTargetPenerima) * 100 : 0
  const summaryValue = summary
    ? `${totalPenerimaHariIni.toLocaleString('id-ID')} / ${totalTargetPenerima.toLocaleString('id-ID')}`
    : 'Memuat data...'
  const summaryPercent = summary ? `${pencapaian.toFixed(2)}%` : '...'

  return (
    <section id="penerima-manfaat" className="statistics">
      <div className="section-shell">
        <div className="section-card">
          <div className="section-header">
            <h2>Penerima Manfaat MBG</h2>
            <p>Daftar yang sudah menerima manfaat Program Makan Bergizi Gratis di Kota Bandung</p>
          </div>

          <div className="stats-summary" aria-label="Ringkasan penerima manfaat">
            <div className="summary-left">
              <div className="summary-icon" aria-hidden="true">👥</div>
              <div className="summary-text">
                <span className="summary-value">{summaryValue}</span>
                <span className="summary-label">Total Penerima Manfaat MBG Hari Ini</span>
              </div>
            </div>
            <div className="summary-right">
              <span className="summary-percent">{summaryPercent}</span>
              <span className="summary-caption">Pencapaian Hari Ini</span>
            </div>
          </div>

          <div className="stats-grid">
            {stats.map(stat => (
              <div key={stat.id} className={`stat-card stat-card-modern ${stat.theme}`}>
                <div className="stat-card-top">
                  <div className="stat-card-icon" aria-hidden="true">{stat.icon}</div>
                  <span className="stat-badge">{stat.percentage.toFixed(1)}%</span>
                </div>
                <div className="stat-card-main">
                  <span className="stat-main-value">{stat.value}</span>
                  <span className="stat-main-divider">/</span>
                  <span className="stat-main-value">{stat.total}</span>
                </div>
                <h3 className="stat-title">{stat.label}</h3>
                <p className="stat-subtitle">{stat.subtitle}</p>
                <div className="stat-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-secondary">
                  <span className="stat-secondary-value">{stat.subValue}/{stat.subTotal}</span>
                  <span className="stat-secondary-label">{stat.subLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

