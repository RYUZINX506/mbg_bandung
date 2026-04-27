import { useEffect, useMemo, useRef, useState } from 'react'
import '../styles/Reports.css'
import { apiRequest, type HomeResponse } from '../config/api'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const datePickerFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
})

const datePickerMonthFormatter = new Intl.DateTimeFormat('id-ID', {
  month: 'long',
  year: 'numeric'
})

const updateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric'
})

function toLocalDateInputValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

function formatReportDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`)
  return dateFormatter.format(date)
}

function formatDatePickerLabel(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`)
  return datePickerFormatter.format(date)
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

function getMonthGrid(viewDate: Date) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)

    return {
      key: toDateValue(date),
      value: date,
      isCurrentMonth: date.getMonth() === month,
    }
  })
}

function formatUpdateTimestamp(dateValue: string, index: number) {
  const baseDate = new Date(`${dateValue}T00:00:00`)
  const times = [
    '17.25.18',
    '14.42.29',
    '14.05.40',
    '13.44.48',
    '13.32.23',
    '12.51.34',
    '12.48.13',
    '12.42.09',
  ]

  return `${updateTimeFormatter.format(baseDate)}, ${times[index % times.length]}`
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sppg')
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateInputValue(new Date()))
  const [homeData, setHomeData] = useState<HomeResponse['data'] | null>(null)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initialDate = parseDateValue(toLocalDateInputValue(new Date()))
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  })
  const datePickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiRequest<HomeResponse>('/home')
      .then((response) => {
        setHomeData(response.data)
      })
      .catch(() => {
        setHomeData(null)
      })
  }, [])

  interface ReportItem {
    label: string
    value: number | string
    total?: number
    accent?: string
  }

  const reportData: Record<string, { title: string; progress: number; items: ReportItem[] }> = {
    sppg: {
      title: 'Laporan SPPG',
      progress: homeData ? Math.min(100, homeData.summary.sppg * 5) : 0,
      items: [
        { label: 'Sekolah Terdaftar', value: homeData?.summary.sekolah ?? 0, total: homeData?.summary.sekolah ?? 0 },
        { label: 'Total SPPG Aktif', value: homeData?.summary.sppg ?? 0 }
      ]
    },
    sekolah: {
      title: 'Laporan Sekolah',
      progress: homeData ? Math.min(100, homeData.summary.laporanSekolah * 10) : 0,
      items: [
        { label: 'Total SPPG Aktif', value: homeData?.summary.sppg ?? 0, accent: 'summary-green' },
        { label: 'Pengaduan Masuk', value: homeData?.summary.pengaduan ?? 0, accent: 'summary-orange' },
        { label: 'Laporan Sekolah', value: homeData?.summary.laporanSekolah ?? 0, accent: 'summary-blue' }
      ]
    }
  }

  const current = reportData[activeTab as keyof typeof reportData]
  const datePickerLabel = formatDatePickerLabel(selectedDate)
  const monthLabel = datePickerMonthFormatter.format(visibleMonth)
  const selectedDateObject = parseDateValue(selectedDate)
  const today = useMemo(() => new Date(), [])
  const dateGrid = useMemo(() => getMonthGrid(visibleMonth), [visibleMonth])

  useEffect(() => {
    const selected = parseDateValue(selectedDate)
    setVisibleMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
  }, [selectedDate])

  useEffect(() => {
    if (!isDatePickerOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDatePickerOpen(false)
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleEscapeKey)

    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isDatePickerOpen])

  const toggleDatePicker = () => {
    setIsDatePickerOpen((previous) => !previous)
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(toDateValue(date))
    setIsDatePickerOpen(false)
  }

  const moveVisibleMonth = (offset: number) => {
    setVisibleMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + offset, 1))
  }
  const sppgSummary = homeData
    ? [
        { label: 'Total SPPG Aktif', value: String(homeData.summary.sppg), accent: 'summary-green' },
        { label: 'Pengaduan Masuk', value: String(homeData.summary.pengaduan), accent: 'summary-orange' },
        { label: 'Laporan Sekolah', value: String(homeData.summary.laporanSekolah), accent: 'summary-blue' }
      ]
    : []
  const metricCards = activeTab === 'sppg'
    ? [
        ...sppgSummary.map((item) => ({
          key: item.label,
          kind: 'summary' as const,
          label: item.label,
          value: item.value,
          accent: item.accent,
          total: undefined as number | undefined,
        })),
        ...current.items.map((item) => ({
          key: item.label,
          kind: 'stat' as const,
          label: item.label,
          value: item.value,
          accent: item.accent,
          total: item.total,
        }))
      ]
    : current.items.map((item) => ({
        key: item.label,
        kind: 'stat' as const,
        label: item.label,
        value: item.value,
        accent: item.accent,
        total: item.total,
      }))
  const schoolList = !homeData
    ? []
    : activeTab === 'sppg'
      ? homeData.topSppg.map((sppg, index) => ({
          id: `sppg-${sppg.id}`,
          name: sppg.name,
          level: 'SPPG',
          location: sppg.kecamatan,
          sppgName: sppg.name,
          updatedAt: formatUpdateTimestamp(selectedDate, index),
          hasMainPhoto: true,
          hasSecondaryPhoto: index % 2 === 0,
        }))
      : homeData.topSchools.map((school, index) => ({
          id: `school-${school.id}`,
          name: school.name,
          level: school.type,
          location: school.kecamatan,
          sppgName: homeData.topSppg[index % Math.max(1, homeData.topSppg.length)]?.name ?? 'SPPG Terdekat',
          updatedAt: formatUpdateTimestamp(selectedDate, index),
          hasMainPhoto: true,
          hasSecondaryPhoto: index % 3 === 1,
        }))

  const reportListTitle = activeTab === 'sppg'
    ? 'Daftar SPPG yang Sudah Lapor'
    : 'Daftar Sekolah yang Sudah Lapor'

  return (
    <section id="laporan-program" className="reports">
      <div className="section-shell">
        <div className="section-card">
          <div className="section-header">
            <h2>Laporan Program MBG</h2>
            <p>Program Nasional Pemerintah Indonesia - Pantau aktivitas real-time upload menu dan laporan harian</p>
            <div className="section-date-wrap" ref={datePickerRef}>
              <button
                type="button"
                className="section-date"
                aria-label="Pilih tanggal laporan"
                aria-expanded={isDatePickerOpen}
                onClick={toggleDatePicker}
              >
                <span className="section-date-label">Tanggal laporan</span>
                <span className="section-date-value">{datePickerLabel}</span>
                <span className="section-date-icon" aria-hidden="true">▾</span>
              </button>

              {isDatePickerOpen && (
                <div className="custom-date-picker" role="dialog" aria-label="Kalender pilih tanggal">
                  <div className="custom-date-picker-header">
                    <button type="button" onClick={() => moveVisibleMonth(-1)} aria-label="Bulan sebelumnya">←</button>
                    <strong>{monthLabel}</strong>
                    <button type="button" onClick={() => moveVisibleMonth(1)} aria-label="Bulan berikutnya">→</button>
                  </div>

                  <div className="custom-date-picker-weekdays">
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>

                  <div className="custom-date-picker-grid">
                    {dateGrid.map((dateCell) => {
                      const isSelected = toDateValue(dateCell.value) === selectedDate
                      const isToday = toDateValue(dateCell.value) === toDateValue(today)

                      return (
                        <button
                          key={dateCell.key}
                          type="button"
                          className={`custom-date-cell ${dateCell.isCurrentMonth ? '' : 'is-muted'} ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
                          onClick={() => handleSelectDate(dateCell.value)}
                        >
                          {dateCell.value.getDate()}
                        </button>
                      )
                    })}
                  </div>

                  <div className="custom-date-picker-footer">
                    <button type="button" onClick={() => handleSelectDate(new Date())}>Hari ini</button>
                    <button type="button" onClick={() => setIsDatePickerOpen(false)}>Tutup</button>
                  </div>
                </div>
              )}
            </div>
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

            <div className="report-progress">
              <div className="progress-info">
                <span className="progress-label">{current.progress}% Progress</span>
              </div>
              <div className="progress-bar-large">
                <div className="progress-fill" style={{ width: `${current.progress}%` }}></div>
              </div>
            </div>

            <div className="school-list">
              <div className="list-header">
                <h4>{reportListTitle}</h4>
              </div>

              <div className="school-table" role="table" aria-label="Daftar sekolah dan SPPG yang sudah lapor">
                <div className="school-table-head" role="row">
                  <span role="columnheader">NAMA SEKOLAH / SPPG</span>
                  <span role="columnheader">JENJANG</span>
                  <span role="columnheader">LOKASI</span>
                  <span role="columnheader">FOTO LAPORAN</span>
                  <span role="columnheader">WAKTU UPDATE</span>
                </div>

                <div className="school-items" role="rowgroup">
                {schoolList.map((school) => (
                  <div key={school.id} className="school-item" role="row">
                    <div className="school-info">
                      <h5>{school.name}</h5>
                      <p className="school-sppg-chip">⌂ {school.sppgName}</p>
                    </div>
                    <div className="school-level">{school.level}</div>
                    <div className="school-location">{school.location}</div>
                    <div className="school-photos" aria-label="Status foto laporan">
                      <span
                        className={`photo-icon ${school.hasMainPhoto ? 'is-active' : ''}`}
                        aria-hidden="true"
                      >
                        🖼
                      </span>
                      <span
                        className={`photo-icon ${school.hasSecondaryPhoto ? 'is-success' : ''}`}
                        aria-hidden="true"
                      >
                        🖼
                      </span>
                    </div>
                    <div className="school-time">
                      <span>{school.updatedAt}</span>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
