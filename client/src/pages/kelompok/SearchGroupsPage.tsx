import { useEffect, useMemo, useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { apiRequest, type ApiListResponse, type GroupItem } from '../../config/api'
import '../../styles/SearchPage.css'

export default function SearchGroupsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    apiRequest<ApiListResponse<GroupItem>>('/groups')
      .then((response) => setGroups(response.data))
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Kelompok gagal dimuat.')
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredGroups = useMemo(() => groups.filter(group => {
    const matchSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        group.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  }), [groups, searchTerm])

  return (
    <>
      <Header />
      <div className="search-page">
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Cari nama kelompok atau kecamatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-large"
            />
          </div>

          <div className="results-info">
            <p>Menampilkan <strong>{filteredGroups.length}</strong> kelompok dari <strong>{groups.length}</strong> kelompok</p>
          </div>

          {loading && <div className="no-results"><p>Memuat data kelompok...</p></div>}
          {error && !loading && <div className="no-results"><p>{error}</p></div>}

          <div className="schools-grid">
            {filteredGroups.length > 0 ? (
              filteredGroups.map(group => (
                <div key={group.id} className="school-card">
                  <div className="school-card-header">
                    <h3>{group.name}</h3>
                    <span className="badge badge-group">{group.category}</span>
                  </div>
                  <div className="school-card-body">
                    <p><strong>Kecamatan:</strong> {group.kecamatan}</p>
                    <p><strong>Jumlah Anggota:</strong> {group.santri} anggota</p>
                    <p><strong>Kabupaten:</strong> {group.kabupaten}</p>
                  </div>
                </div>
              ))
            ) : !loading && !error ? (
              <div className="no-results">
                <p>Tidak ada kelompok yang sesuai dengan pencarian Anda.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
