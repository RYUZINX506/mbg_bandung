import { useEffect, useState } from 'react'
import '../styles/Statistics.css'
import { apiRequest, type HomeResponse } from '../config/api'

function formatNumber(value: number) {
  return value.toLocaleString('id-ID')
}

function toLocalDateInputValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

export default function Statistics() {
  const [summary, setSummary] = useState<HomeResponse['data']['summary'] | null>(null)
  const [selectedDate] = useState(() => toLocalDateInputValue(new Date()))

  useEffect(() => {
    apiRequest<HomeResponse>(`/home?date=${selectedDate}`)
      .then((response) => {
        setSummary(response.data.summary)
      })
      .catch(() => {
        setSummary(null)
      })
  }, [selectedDate])

  const totalPenerimaHariIni = summary?.totalPenerimaHariIni ?? 0
  const totalTargetPenerima = summary?.totalTargetPenerima ?? 0
  const sekolahLaporHariIni = summary?.sekolahLaporHariIni ?? 0
  const sppgLaporHariIni = summary?.sppgLaporHariIni ?? 0
  const totalSekolah = summary?.sekolah ?? 0
  const totalSppg = summary?.totalSppg ?? summary?.sppg ?? 0
  const totalPenerimaKelompok = summary?.totalPenerimaKelompok ?? 0
  const totalKelompokBumil = summary?.kelompokBumil ?? 0
  const totalKelompokBalita = summary?.kelompokBalita ?? 0
  const totalKelompokBusui = summary?.kelompokBusui ?? 0
  const totalKelompokKategori = totalKelompokBumil + totalKelompokBalita + totalKelompokBusui

  const sekolahPercentage = totalSekolah > 0 ? (sekolahLaporHariIni / totalSekolah) * 100 : 0
  const sppgPercentage = totalSppg > 0 ? (sppgLaporHariIni / totalSppg) * 100 : 0
  const kelompokPercentage = totalPenerimaKelompok > 0 ? (totalKelompokKategori / totalPenerimaKelompok) * 100 : 0

  const stats = summary
    ? [
        {
          id: 1,
          label: 'Sekolah',
          theme: 'theme-paud',
          value: sekolahLaporHariIni,
          total: totalSekolah,
          percentage: Math.min(100, sekolahPercentage),
          icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 11 12 6l9 5-9 5-9-5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M6 12.5V18h12v-5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          ),
          subtitle: 'Sekolah yang sudah lapor',
          subValue: totalPenerimaHariIni,
          subTotal: totalTargetPenerima,
          subLabel: 'Siswa penerima',
        },
        {
          id: 2,
          label: 'SPPG',
          theme: 'theme-tk',
          value: sppgLaporHariIni,
          total: totalSppg,
          percentage: Math.min(100, sppgPercentage),
          icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 20h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M6 20V9l6-4 6 4v11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          ),
          subtitle: 'SPPG yang sudah lapor',
          subValue: summary?.totalDistribusiPorsiHariIni ?? 0,
          subTotal: totalTargetPenerima,
          subLabel: 'Distribusi porsi / target penerima',
        },
        {
          id: 3,
          label: 'Kelompok',
          theme: 'theme-sd',
          value: totalKelompokKategori,
          total: totalPenerimaKelompok,
          percentage: Math.min(100, kelompokPercentage),
          icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="8" cy="8" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="16" cy="8" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M5.5 16c.6-1.4 1.8-2.2 3.4-2.2s2.8.8 3.4 2.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M12.1 16c.6-1.2 1.6-1.9 2.9-1.9 1.3 0 2.3.7 2.9 1.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ),
          subtitle: 'Bumil, Busui & Balita',
          subValue: totalKelompokKategori,
          subTotal: totalPenerimaKelompok,
          subLabel: 'Penerima manfaat kelompok',
        },
      ]
    : []

  const totalPorsiDilapor = summary?.totalDistribusiPorsiHariIni ?? 0
  const totalPenerimaMbg = totalTargetPenerima + totalPenerimaKelompok
  const pelaporanPersentase = totalPenerimaMbg > 0 ? (totalPorsiDilapor / totalPenerimaMbg) * 100 : 0
  const summaryValue = summary
    ? `${formatNumber(totalPorsiDilapor)} / ${formatNumber(totalPenerimaMbg)}`
    : 'Memuat data...'
  const summaryPercent = summary ? `${pelaporanPersentase.toFixed(1)}%` : '...'
  const kelompokBreakdown = [
    { label: 'Bumil', value: summary?.kelompokBumil ?? 0, theme: 'theme-ibu' },
    { label: 'Balita', value: summary?.kelompokBalita ?? 0, theme: 'theme-paud' },
    { label: 'Busui', value: summary?.kelompokBusui ?? 0, theme: 'theme-tk' },
  ]

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
                <span className="summary-label">Total Penerima Manfaat MBG</span>
              </div>
            </div>
            <div className="summary-right">
              <span className="summary-percent">{summaryPercent}</span>
              <span className="summary-caption">Porsi dilaporkan dari total penerima</span>
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
                  <span className="stat-main-value">{formatNumber(stat.value)}</span>
                  <span className="stat-main-divider">dari</span>
                  <span className="stat-main-value">{formatNumber(stat.total)}</span>
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
                {stat.id === 3 ? (
                  <div className="stat-breakdown" aria-label="Rincian kelompok penerima manfaat">
                    {kelompokBreakdown.map((item) => (
                      <span key={item.label} className={`stat-breakdown-chip ${item.theme}`}>
                        <strong>{item.label}</strong>
                        <em>{formatNumber(item.value)}</em>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="stat-secondary">
                    <span className="stat-secondary-value">{formatNumber(stat.subValue)}/{formatNumber(stat.subTotal)}</span>
                    <span className="stat-secondary-label">{stat.subLabel}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

