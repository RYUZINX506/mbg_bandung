import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { apiRequest, type SppgItem } from '../../config/api'
import '../../styles/SearchPage.css'

export default function SearchSPPGPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedKecamatan, setSelectedKecamatan] = useState('semua')
  const [page, setPage] = useState(1)
  const [sppgList, setSppgList] = useState<SppgItem[]>([])
  const [kecamatanList, setKecamatanList] = useState<string[]>(['semua'])
  const [loading, setLoading] = useState(true)
  const pageSize = 6
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    apiRequest<{ data: SppgItem[]; meta: { kecamatanOptions?: string[] } }>('/sppg?per_page=50')
      .then((response) => {
        setSppgList(response.data)
        setKecamatanList(['semua', ...(response.meta.kecamatanOptions ?? [])])
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredSPPG = useMemo(() => sppgList.filter(sppg => {
    const matchSearch = sppg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       sppg.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
    const matchKecamatan = selectedKecamatan === 'semua' || sppg.kecamatan === selectedKecamatan
    return matchSearch && matchKecamatan
  }), [searchTerm, selectedKecamatan, sppgList])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, selectedKecamatan])

  const totalPages = Math.max(1, Math.ceil(filteredSPPG.length / pageSize))
  const pagedSPPG = filteredSPPG.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <Header />
      <div className="search-page">
        <div className="search-container">
          <div className="search-box">
            <div className="search-inline">
              <select
                className="search-select"
                value={selectedKecamatan}
                onChange={(e) => setSelectedKecamatan(e.target.value)}
              >
                {kecamatanList.map(kec => (
                  <option key={kec} value={kec}>
                    {kec === 'semua' ? 'Semua Kecamatan' : kec}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Cari nama SPPG atau kecamatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-large"
              />
            </div>
            <div className="results-info">
              <p>Menampilkan <strong>{filteredSPPG.length}</strong> SPPG dari <strong>{sppgList.length}</strong> SPPG</p>
            </div>
          </div>

          {loading && <div className="no-results"><p>Memuat data SPPG...</p></div>}

          <div className="schools-grid">
            {pagedSPPG.length > 0 ? (
              pagedSPPG.map(sppg => (
                <div
                  key={sppg.id}
                  className="school-card clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/sppg/${sppg.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      navigate(`/sppg/${sppg.id}`)
                    }
                  }}
                >
                  <div className="school-card-header">
                    <h3>{sppg.name}</h3>
                    <span className={`badge ${sppg.lokasi.includes('Terpencil') ? 'badge-terpencil' : 'badge-sppg'}`}>
                      {sppg.lokasi.includes('Terpencil') ? 'Terpencil' : 'Reguler'}
                    </span>
                  </div>
                  <div className="school-card-body">
                    <p><strong>Kecamatan:</strong> {sppg.kecamatan}</p>
                    <p><strong>Penerima Manfaat:</strong> {sppg.penerima} orang</p>
                    <p><strong>Lokasi:</strong> {sppg.lokasi}</p>
                    <p><strong>Status:</strong> <span className="status-badge">{sppg.status}</span></p>
                  </div>
                </div>
              ))
            ) : !loading ? (
              <div className="no-results">
                <p>Tidak ada SPPG yang sesuai dengan pencarian Anda.</p>
              </div>
            ) : null}
          </div>

          {filteredSPPG.length > pageSize && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Sebelumnya
              </button>
              <span className="pagination-info">
                Halaman {page} dari {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
