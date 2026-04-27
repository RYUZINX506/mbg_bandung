import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { apiRequest, type ApiListResponse, type SchoolItem } from '../config/api'
import '../styles/SearchPage.css'

export default function SearchSchoolsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('semua')
  const [schools, setSchools] = useState<SchoolItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    apiRequest<ApiListResponse<SchoolItem>>('/schools')
      .then((response) => {
        setSchools(response.data)
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Sekolah gagal dimuat.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const filteredSchools = useMemo(() => schools.filter(school => {
    const matchSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       school.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = selectedType === 'semua' || school.type === selectedType
    return matchSearch && matchType
  }), [schools, searchTerm, selectedType])

  return (
    <>
      <Header />
      <div className="search-page">
        <div className="search-container">
          <div className="search-box">
            <div className="search-inline">
              <select
                className="search-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {['semua', 'SD', 'SMP', 'SMA', 'Pesantren'].map(type => (
                  <option key={type} value={type}>
                    {type === 'semua' ? 'Semua Tipe' : type}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Cari nama sekolah atau kecamatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-large"
              />
            </div>
            <div className="results-info">
              <p>Menampilkan <strong>{filteredSchools.length}</strong> sekolah dari <strong>{schools.length}</strong> sekolah</p>
            </div>
          </div>

          {loading && <div className="no-results"><p>Memuat data sekolah...</p></div>}
          {error && !loading && <div className="no-results"><p>{error}</p></div>}

          <div className="schools-grid">
            {filteredSchools.length > 0 ? (
              filteredSchools.map(school => (
                <div
                  key={school.id}
                  className="school-card clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/sekolah/${school.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      navigate(`/sekolah/${school.id}`)
                    }
                  }}
                >
                  <div className="school-card-header">
                    <h3>{school.name}</h3>
                    <span
                      className={`badge school-type-badge ${school.isActive ? 'is-active' : 'is-inactive'}`}
                    >
                      {school.type}
                    </span>
                  </div>
                  <div className="school-card-body">
                    <div className="school-attr-row">
                      <span className="school-attr-label">Nama Sekolah</span>
                      <span className="school-attr-value">{school.name}</span>
                    </div>
                    <div className="school-attr-row">
                      <span className="school-attr-label">Alamat</span>
                      <span className="school-attr-value">{school.alamat}</span>
                    </div>
                    <div className="school-attr-row">
                      <span className="school-attr-label">Jumlah Siswa</span>
                      <span className="school-attr-value student-count"><span aria-hidden="true">👥</span>{school.siswa} siswa</span>
                    </div>
                    <div className="school-attr-row">
                      <span className="school-attr-label">No Telp Sekolah</span>
                      <span className="school-attr-value school-phone">{school.noTelp}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : !loading && !error ? (
              <div className="no-results">
                <p>Tidak ada sekolah yang sesuai dengan pencarian Anda.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
