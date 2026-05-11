import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Reports.css'
import { apiRequest, type HomeResponse } from '../config/api'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const updateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

function toLocalDateInputValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

function parseDateValue(dateValue: string) {
  const [year, month, day] = dateValue.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeDateString(value: unknown) {
  if (typeof value === 'string') {
    const datePart = value.match(/^(\d{4}-\d{2}-\d{2})/)
    if (datePart) {
      return datePart[1]
    }

    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return toDateValue(parsed)
    }

    return ''
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toDateValue(value)
  }

  return ''
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sppg')
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateInputValue(new Date()))
  const [homeData, setHomeData] = useState<HomeResponse['data'] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kirim tanggal sebagai query string, misal: /home?date=YYYY-MM-DD
        const response = await apiRequest<HomeResponse>(`/home?date=${selectedDate}`)
        setHomeData(response.data)
      } catch {
        setHomeData(null)
      }
    }
    fetchData()
  }, [selectedDate])

  interface ReportItem {
    label: string
    value: number | string
    total?: number
    accent?: string
  }

  const reportData: Record<string, { title: string; progress: number; items: ReportItem[] }> = {
    sppg: {
      title: 'Laporan SPPG',
      progress: homeData && (homeData.summary.sppg ?? 0) > 0
        ? Math.min(100, ((homeData.summary.sppgLaporHariIni ?? 0) / homeData.summary.sppg) * 100)
        : 0,
      items: [
        { label: 'Sekolah Terdaftar', value: homeData?.summary.sekolah ?? 0, total: homeData?.summary.sekolah ?? 0 },
        { label: 'Total SPPG Aktif', value: homeData?.summary.sppg ?? 0 },
        { label: 'Total Distribusi Porsi', value: Number(homeData?.summary?.totalDistribusiPorsiHariIni) || 0, accent: 'summary-orange' },
        { label: 'SPPG Belum Lapor', value: homeData ? (homeData.summary.sppgBelumLapor ?? Math.max(0, homeData.summary.sppg - (homeData.summary.sppgLaporHariIni ?? 0))) : 0, accent: 'summary-red' }
      ]
    },
    sekolah: {
      title: 'Laporan Sekolah',
      progress: homeData && (homeData.summary.sekolahAktif ?? 0) > 0
        ? Math.min(100, ((homeData.summary.sekolahLaporHariIni ?? 0) / (homeData.summary.sekolahAktif ?? 0)) * 100)
        : 0,
      items: [
        { label: 'Total Sekolah Aktif', value: homeData?.summary.sekolahAktif ?? 0, accent: 'summary-blue' },
        { label: 'Sekolah Belum Lapor', value: homeData?.summary.sekolahBelumLapor ?? Math.max(0, (homeData?.summary.sekolahAktif ?? 0) - (homeData?.summary.sekolahLaporHariIni ?? 0)), accent: 'summary-red' },
          { label: 'Total porsi diterima', value: homeData?.summary.totalPenerimaHariIni ?? 0, accent: 'summary-orange' }
      ]    
    }
  }         

  const current = reportData[activeTab as keyof typeof reportData]
  const showDateControls = true
  const navigate = useNavigate()

  const metricCards = (() => {
    if (activeTab === 'sppg') {
      const totalSppg = homeData?.summary.sppg ?? 0
      // const totalDistribusi = (homeData as any)?.summary?.totalDistribusiPorsi ?? homeData?.summary.totalPenerimaHariIni ?? 0 // unused
      const totalSppgBelum = homeData?.summary.sppgBelumLapor ?? Math.max(0, totalSppg - (homeData?.summary.sppgLaporHariIni ?? 0))

      return [
        {
          key: 'Total SPPG Aktif',
          kind: 'summary' as const,
          label: 'Total SPPG Aktif',
          value: String(totalSppg),
          accent: 'summary-blue',
          total: undefined as number | undefined,
        },
        {
          key: 'SPPG Belum Lapor',
          kind: 'summary' as const,
          label: 'SPPG Belum Lapor',
          value: String(totalSppgBelum),
          accent: 'summary-red',
          total: undefined as number | undefined,
        },
        {
          key: 'Total Distribusi Porsi',
          kind: 'summary' as const,
          label: 'Total Distribusi Porsi',
          value: String(homeData?.summary.totalDistribusiPorsiHariIni ?? 0),
          accent: 'summary-orange',
          total: undefined as number | undefined,
        },
      ]
    }

    return current.items.map((item) => ({
      key: item.label,
      kind: 'summary' as const,
      label: item.label,
      value: item.value,
      accent: item.accent,
      total: item.total,
    }))
  })()
  // Filter SPPG yang sudah upload laporan pada tanggal yang dipilih
  const filterBySelectedDateLaporan = (sppg: any) => {
    if (!sppg.laporan_harian || !Array.isArray(sppg.laporan_harian)) return false
    return sppg.laporan_harian.some((laporan: any) => normalizeDateString(laporan.tanggal) === selectedDate)
  }

  const getWaktuUpdate = (sppg: any) => {
    if (!sppg.laporan_harian || !Array.isArray(sppg.laporan_harian)) return ''

    const laporanDiTanggalTerpilih = sppg.laporan_harian.filter(
      (laporan: any) => normalizeDateString(laporan.tanggal) === selectedDate,
    )

    if (laporanDiTanggalTerpilih.length === 0) return ''

    const laporanTerbaru = [...laporanDiTanggalTerpilih].sort((left: any, right: any) => {
      const leftTime = new Date(left.created_at ?? left.updated_at ?? left.tanggal).getTime()
      const rightTime = new Date(right.created_at ?? right.updated_at ?? right.tanggal).getTime()
      return rightTime - leftTime
    })[0]

    // Gunakan created_at untuk menampilkan waktu update, fallback ke tanggal jika created_at tidak ada
    if (laporanTerbaru.created_at) {
      return updateTimeFormatter.format(new Date(laporanTerbaru.created_at))
    }
    return updateTimeFormatter.format(new Date(laporanTerbaru.tanggal))
  }

  const formatSchoolReportUpdatedAt = (dateValue: string) => {
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) {
      return ''
    }

    return updateTimeFormatter.format(date)
  }

  const schoolList = !homeData
    ? []
    : activeTab === 'sppg'
      ? homeData.topSppg
          .filter((sppg) => filterBySelectedDateLaporan(sppg))
          .map((sppg, index) => ({
            id: `sppg-${sppg.id}`,
            name: sppg.name,
            level: 'SPPG',
            location: sppg.kecamatan,
            sppgName: sppg.name,
            tujuanSekolah: (() => {
              // build lookup from distributionsBySchool and schoolReportsToday
              const lookup = new Map<number, string>()
              ;(homeData.distributionsBySchool ?? []).forEach((s: any) => lookup.set(s.schoolId, s.name))
              ;(homeData.schoolReportsToday ?? []).forEach((r: any) => lookup.set(r.schoolId, r.name))

              const sekolahNames = ((sppg as any).laporan_harian ?? [])
                .filter((laporan: any) => normalizeDateString(laporan.tanggal) === selectedDate)
                .map((laporan: any) => lookup.get(laporan.sekolah_id) || String(laporan.sekolah_id))
              // unique
              return Array.from(new Set(sekolahNames)).join(', ')
            })(),
            updatedAt: getWaktuUpdate(sppg),
            hasMainPhoto: true,
            hasSecondaryPhoto: index % 2 === 0,
            fotoMenuUrl: null,
            fotoSiswaUrl: null,
            path: `/sppg/${sppg.id}`,
          }))
      : (homeData.schoolReportsToday ?? []).map((report) => ({
          id: `sekolah-${report.id}`,
          name: report.name,
          level: report.type,
          location: report.kecamatan,
          sppgName: 'Laporan Sekolah',
          tujuanSekolah: (report as any).tujuanSekolah ?? '',
          updatedAt: formatSchoolReportUpdatedAt(report.updatedAt),
          hasMainPhoto: report.hasMainPhoto,
          hasSecondaryPhoto: report.hasSecondaryPhoto,
          fotoMenuUrl: report.fotoMenuUrl ?? null,
          fotoSiswaUrl: report.fotoSiswaUrl ?? null,
          path: `/sekolah/${report.schoolId}`,
        }))

  const visibleSchoolList = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return schoolList
    }

    return schoolList.filter((school) =>
      [school.name, school.location, school.sppgName, school.updatedAt, (school as any).tujuanSekolah]
        .some((value) => (value || '').toLowerCase().includes(normalizedQuery)),
    )
  }, [schoolList, searchQuery])

  const exportSchoolList = () => {
    const rows: string[][] = []
    rows.push(['Nama Sekolah / SPPG', 'Lokasi', 'Tujuan Sekolah', 'Foto Laporan', 'Waktu Update'])

    visibleSchoolList.forEach((s) => {
      const photos = [s.hasMainPhoto ? 'utama' : '', s.hasSecondaryPhoto ? 'sekunder' : '']
        .filter(Boolean)
        .join('; ') || 'tidak ada'

      rows.push([s.name, s.location, (s as any).tujuanSekolah || '', photos, s.updatedAt])
    })

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab === 'sppg' ? 'laporan_sppg' : 'laporan_sekolah'}_${selectedDate}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const reportListTitle = activeTab === 'sppg'
    ? 'Daftar SPPG yang Sudah Lapor'
    : 'Daftar Sekolah yang Sudah Lapor'

  const progressTitle = activeTab === 'sppg' ? 'Laporan SPPG Hari Ini' : 'Laporan Sekolah Hari Ini'
  const progressDescription = activeTab === 'sppg'
    ? 'Distribusi menu dan laporan harian'
    : 'Laporan konsumsi dan dokumentasi sekolah'
  const progressCurrentCount = activeTab === 'sppg'
    ? (homeData?.summary.sppgLaporHariIni ?? 0)
    : (homeData?.summary.sekolahLaporHariIni ?? 0)
  const progressTotalCount = activeTab === 'sppg'
    ? (homeData?.summary.sppg ?? 0)
    : (homeData?.summary.sekolahAktif ?? 0)
  const progressUnit = activeTab === 'sppg' ? 'SPPG' : 'sekolah'

  return (
    <section id="laporan-program" className="reports">
      <div className="section-shell">
        <div className="section-card">
          <div className="section-header">
            <h2>Laporan Program MBG</h2>
            <p>Program Nasional Pemerintah Indonesia - Pantau aktivitas real-time upload menu dan laporan harian</p>
            {showDateControls && (
              <div className="section-date-wrap">
                <label className="section-date-label" htmlFor="report-date-native">
                  Tanggal laporan
                </label>
                <input
                  id="report-date-native"
                  className="section-date-native"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  aria-label="Tanggal laporan"
                />
              </div>
            )}
          </div>

          <div className="report-tabs">
            <button 
              className={`tab-btn ${activeTab === 'sppg' ? 'active' : ''}`}
              onClick={() => setActiveTab('sppg')}
            >
              Laporan SPPG
            </button>
            <button 
              className={`tab-btn ${activeTab === 'sekolah' ? 'active' : ''}`}
              onClick={() => setActiveTab('sekolah')}
            >
              Laporan Sekolah
            </button>
          </div>

          <div className="report-content">
            <div className="progress-card clean">
              <div className="progress-card-header">
                <div>
                  <span className="progress-card-title">{progressTitle}</span>
                  <div className="progress-card-desc">{progressDescription}</div>
                </div>
                {showDateControls && (
                  <span className="progress-card-date">{dateFormatter.format(parseDateValue(selectedDate))}</span>
                )}
              </div>
              <div className="progress-card-barwrap">
                <div className="progress-card-bar">
                  <div className="progress-card-barfill" style={{ width: `${isNaN(current.progress) ? 0 : current.progress}%` }} />
                </div>
                <span className="progress-card-percent">{isNaN(current.progress) ? '0%' : `${current.progress}%`}</span>
                <span className="progress-card-count">
                  {progressCurrentCount}
                  {' dari '}
                  {progressTotalCount}
                  {' '}
                  {progressUnit}
                </span>
              </div>
            </div>
            <div
              className="report-metrics-grid"
              aria-label={activeTab === 'sppg' ? 'Ringkasan laporan SPPG' : 'Ringkasan laporan sekolah'}
              style={{ gridTemplateColumns: `repeat(${metricCards.length}, minmax(0, 1fr))` }}
            >
              {metricCards.map((item) => (
                <div key={item.key} className={`${item.kind === 'summary' ? 'summary-card' : 'report-stat-item'} ${item.accent ?? ''}`}>
                  {item.kind === 'summary' ? (
                    <>
                      <span className="summary-card-label">{item.label}</span>
                      <span className="summary-card-value">{item.value}</span>
                    </>
                  ) : (
                    <>
                      <span className="stat-label">{item.label}</span>
                      <span className="stat-value">
                        {item.value}
                        {item.total && <span className="stat-total"> dari {item.total}</span>}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>

            

            <div className="school-list">
              <div className="list-header">
                <div className="list-header-main">
                  <h4>{reportListTitle}</h4>
                  <label className="school-search" htmlFor="report-search">
                    <input
                      id="report-search"
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Cari laporan..."
                      aria-label="Cari data laporan"
                    />
                  </label>
                </div>
                <div className="list-actions">
                  <button
                    type="button"
                    className="export-btn"
                    onClick={exportSchoolList}
                    disabled={visibleSchoolList.length === 0}
                    aria-disabled={visibleSchoolList.length === 0}
                  >
                    Export Excel
                  </button>
                </div>
              </div>

              {visibleSchoolList.length === 0 ? (
                <div className="empty-list">Belum ada laporan untuk tanggal ini.</div>
              ) : (
                <div className="school-table" role="table" aria-label="Daftar sekolah dan SPPG yang sudah lapor">
                  <div className="school-table-head" role="row">
                    <span role="columnheader">NAMA SEKOLAH / SPPG</span>
                    <span role="columnheader">LOKASI</span>
                    <span role="columnheader">TUJUAN SEKOLAH</span>
                    <span role="columnheader">FOTO LAPORAN</span>
                    <span role="columnheader">WAKTU UPDATE</span>
                  </div>

                  <div className="school-items" role="rowgroup">
                    {visibleSchoolList.map((school) => (
                      <div key={school.id} className="school-item-wrapper">
                        <div
                          className={`school-item clickable ${expandedRowId === school.id ? 'expanded' : ''}`}
                          role="row"
                          tabIndex={0}
                          onClick={() => setExpandedRowId(expandedRowId === school.id ? null : school.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              setExpandedRowId(expandedRowId === school.id ? null : school.id)
                            }
                          }}
                        >
                          <div className="school-info">
                            <h5>{school.name}</h5>
                            <p className="school-sppg-chip">⌂ {school.sppgName}</p>
                          </div>
                          <div className="school-location">{school.location}</div>
                          <div className="school-targets">{(school as any).tujuanSekolah || '-'}</div>
                          <div className="school-photos" aria-label="Status foto laporan">
                            <div className="school-photo-status">
                              <span className={`photo-icon ${school.hasMainPhoto ? 'is-active' : ''}`} aria-hidden="true">🍽</span>
                              <span>{school.fotoMenuUrl ? 'Menu tersedia' : 'Menu tidak ada'}</span>
                            </div>
                            <div className="school-photo-status">
                              <span className={`photo-icon ${school.hasSecondaryPhoto ? 'is-success' : ''}`} aria-hidden="true">👥</span>
                              <span>{school.fotoSiswaUrl ? 'Siswa tersedia' : 'Siswa tidak ada'}</span>
                            </div>
                          </div>
                          <div className="school-time">
                            <span>{school.updatedAt}</span>
                          </div>
                        </div>

                        {expandedRowId === school.id && (
                          <div className="school-item-detail">
                            <div className="school-item-detail-row">
                              <strong>Lokasi</strong>
                              <span>{school.location}</span>
                            </div>
                            <div className="school-item-detail-row">
                              <strong>Update</strong>
                              <span>{school.updatedAt}</span>
                            </div>
                            {school.path && (
                              <button type="button" className="school-item-detail-btn" onClick={() => navigate(school.path)}>
                                Detail lengkap
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}
