import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, type RoleOption } from '../../config/api'
import { PRIVATE_LOGIN_PATH } from '../../config/privateRoutes'
import { getTableGroup, superadminTableGroups } from './adminMindmap'
import '../../styles/AdminPanelPage.css'

type AdminStatsResponse = {
  data: {
    user: {
      id: number
      kode: string | null
      name: string
      email: string | null
      role: string | null
    }
    totals: {
      tables: number
      records: number
      users: number
      complaints: number
    }
    tableCounts: Record<string, number>
  }
}

type AdminTableSchema = {
  name: string
  label: string
  rowCount: number
  primaryKey: string
  columns: Array<{
    name: string
    dataType: string
    columnType: string
    nullable: boolean
    default: string | null
    extra: string
    enumOptions: string[]
  }>
}

type AdminSchemaResponse = {
  data: AdminTableSchema[]
}

type AdminRowsResponse = {
  data: Array<Record<string, unknown>>
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
    columns: string[]
  }
}

type AdminMutationResponse = {
  message: string
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'Ya' : 'Tidak'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

const prettyLabel = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

export default function SuperAdminPanelPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem('mbg_token')
  const role = localStorage.getItem('mbg_role')
  const formSectionRef = useRef<HTMLElement | null>(null)
  const [stats, setStats] = useState<AdminStatsResponse['data'] | null>(null)
  const [tables, setTables] = useState<AdminTableSchema[]>([])
  const [selectedTable, setSelectedTable] = useState('')
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([])
  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (role && role !== 'superadmin') {
      navigate('/admin-dashboard', { replace: true })
    }
  }, [navigate, role])

  const selectedTableMeta = useMemo(
    () => tables.find((table) => table.name === selectedTable) ?? null,
    [tables, selectedTable],
  )

  const selectedGroup = useMemo(
    () => (selectedTable ? getTableGroup(selectedTable) : null),
    [selectedTable],
  )

  const groupedTables = useMemo(
    () =>
      superadminTableGroups.map((group) => ({
        ...group,
        tables: tables.filter((table) => group.tables.includes(table.name)).sort((left, right) => left.label.localeCompare(right.label)),
      })),
    [tables],
  )

  const editableColumns = useMemo(
    () =>
      selectedTableMeta?.columns.filter(
        (column) => column.name !== 'id' && !column.extra.includes('auto_increment'),
      ) ?? [],
    [selectedTableMeta],
  )

  const tableColumns = useMemo(() => {
    if (!selectedTableMeta) {
      return [] as string[]
    }

    const preferred = ['name', 'nama', 'title', 'kode', 'status']
    const available = selectedTableMeta.columns.map((column) => column.name)
    const picked = preferred.filter((column) => available.includes(column))

    if (picked.length > 0) {
      return picked.slice(0, 3)
    }

    return available.filter((column) => column !== 'id').slice(0, 3)
  }, [selectedTableMeta])

  const resetForm = () => {
    const next: Record<string, string> = {}

    editableColumns.forEach((column) => {
      next[column.name] = ''
    })

    setFormData(next)
    setEditingId(null)
  }

  const loadRows = async (table: string, page: number, query: string) => {
    if (!token || !table) {
      return
    }

    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: '10',
      })

      if (query.trim()) {
        params.set('search', query.trim())
      }

      const response = await apiRequest<AdminRowsResponse>(`/admin/rows/${table}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setRows(response.data)
      setCurrentPage(response.meta.currentPage)
      setLastPage(response.meta.lastPage)
      setTotalRows(response.meta.total)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Data tabel gagal dimuat.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      setError('Sesi admin belum ada. Silakan login terlebih dahulu.')
      return
    }

    const bootstrap = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [statsResponse, schemaResponse, rolesResponse] = await Promise.all([
          apiRequest<AdminStatsResponse>('/admin/stats', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          apiRequest<AdminSchemaResponse>('/admin/schema', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          apiRequest<AdminRowsResponse>('/admin/rows/roles?perPage=100', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        setStats(statsResponse.data)
        setTables(schemaResponse.data)
        setRoleOptions(
          [...rolesResponse.data]
            .map((roleItem) => ({
              id: Number(roleItem.id ?? 0),
              code: String(roleItem.code ?? ''),
              label: String(roleItem.label ?? roleItem.code ?? ''),
              description: roleItem.description === null || roleItem.description === undefined ? null : String(roleItem.description),
              sort_order: Number(roleItem.sort_order ?? 0),
            }))
            .filter((roleItem) => roleItem.code)
            .sort((left, right) => left.sort_order - right.sort_order),
        )

        const preferredTable = schemaResponse.data.find((table) => table.name === 'users')?.name
        const firstGroup = superadminTableGroups.find((group) => schemaResponse.data.some((table) => group.tables.includes(table.name)))
        const firstTable = preferredTable ?? firstGroup?.tables.find((tableName) => schemaResponse.data.some((table) => table.name === tableName)) ?? schemaResponse.data[0]?.name ?? ''
        setSelectedTable(firstTable)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Panel superadmin gagal dimuat.')
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrap()
  }, [token, navigate])

  useEffect(() => {
    if (!selectedTable) {
      return
    }

    setSearchInput('')
    setActiveSearch('')
    setCurrentPage(1)
    setMessage('')
    setError('')
    resetForm()
    setIsFormOpen(false)
    void loadRows(selectedTable, 1, '')
  }, [selectedTable])

  const handleSearch = () => {
    setActiveSearch(searchInput)
    void loadRows(selectedTable, 1, searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setActiveSearch('')
    void loadRows(selectedTable, 1, '')
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsFormOpen(true)
    setMessage('')
    setError('')
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleEdit = (row: Record<string, unknown>) => {
    const next: Record<string, string> = {}

    editableColumns.forEach((column) => {
      const value = row[column.name]
      next[column.name] = value === null || value === undefined ? '' : String(value)
    })

    const parsedId = Number(row.id)

    setFormData(next)
    setEditingId(Number.isFinite(parsedId) ? parsedId : null)
    setIsFormOpen(true)
    setMessage('')
    setError('')
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleDelete = async (id: number) => {
    if (!token || !selectedTable) {
      return
    }

    const confirmed = window.confirm('Yakin ingin menghapus data ini?')

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')

    try {
      const response = await apiRequest<AdminMutationResponse>(`/admin/rows/${selectedTable}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setMessage(response.message)
      void loadRows(selectedTable, currentPage, activeSearch)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menghapus data.')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token || !selectedTable) {
      return
    }

    setIsSaving(true)
    setMessage('')
    setError('')

    try {
      const endpoint = editingId
        ? `/admin/rows/${selectedTable}/${editingId}`
        : `/admin/rows/${selectedTable}`

      const response = await apiRequest<AdminMutationResponse>(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: formData }),
      })

      setMessage(response.message)
      setIsFormOpen(false)
      resetForm()
      void loadRows(selectedTable, currentPage, activeSearch)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menyimpan data.')
    } finally {
      setIsSaving(false)
    }
  }

  const currentGroupTitle = selectedGroup?.title ?? 'Pilih Modul'
  const currentGroupDescription = selectedGroup?.description ?? 'Pilih tabel untuk mulai mengelola data.'

  if (isLoading && !stats) {
    return (
      <main className="admin-page admin-page-superadmin">
        <div className="admin-layout admin-layout-superadmin">
          <aside className="admin-sidebar admin-sidebar-superadmin">
            <div>
              <div className="admin-brand">Superadmin MBG</div>
              <div className="admin-version">Database Modules</div>
            </div>
          </aside>
          <section className="admin-main admin-main-superadmin">
            <section className="admin-panel admin-panel-mindmap">
              <div className="admin-empty-state">Memuat panel superadmin...</div>
            </section>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-page admin-page-superadmin">
      <div className="admin-layout admin-layout-superadmin">
        <aside className="admin-sidebar admin-sidebar-superadmin">
          <div>
            <div className="admin-brand">Superadmin MBG</div>
            <div className="admin-version">Database Modules</div>

            <nav className="admin-nav admin-nav-superadmin" aria-label="Modul superadmin dari database">
              <button
                type="button"
                className={`admin-nav-item ${selectedTable === 'users' ? 'active' : ''}`}
                onClick={() => setSelectedTable('users')}
                style={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}
              >
                <span>Panel Utama</span>
                <small>CRUD</small>
              </button>

              {groupedTables.map((group) => (
                <div key={group.key} className="admin-group">
                  <div className="admin-group-title">{group.title}</div>
                  <div className="admin-group-description">{group.description}</div>
                  <div className="admin-group-list">
                    {group.tables.map((table) => (
                      <button
                        key={table.name}
                        type="button"
                        className={`admin-nav-item ${selectedTable === table.name ? 'active' : ''}`}
                        onClick={() => setSelectedTable(table.name)}
                      >
                        <span>{table.label}</span>
                        <small>{table.rowCount}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="admin-sidebar-foot">
            <button
              type="button"
              className="admin-text-btn"
              onClick={() => {
                localStorage.removeItem('mbg_token')
                localStorage.removeItem('mbg_role')
                window.location.href = PRIVATE_LOGIN_PATH
              }}
            >
              Sign Out
            </button>
          </div>
        </aside>

        <section className="admin-main admin-main-superadmin">
          <header className="admin-topbar admin-topbar-superadmin">
            <div>
              <p className="admin-kicker">Panel Admin MBG</p>
              <h1>Superadmin</h1>
              <p className="admin-topbar-subtitle">
                Kelola master data, akun, dan seluruh tabel sesuai mindmap superadmin.
              </p>
            </div>
            <div className="admin-topbar-tags">
              <span>CRUD</span>
              <span>Soft Delete</span>
              <span>Master Data</span>
            </div>
          </header>

          <section className="admin-stats-grid admin-stats-grid-superadmin" aria-label="Ringkasan superadmin">
            <article className="admin-stat-card admin-stat-card-mindmap"><span>Jumlah Tabel</span><p>{stats?.totals.tables ?? 0}</p></article>
            <article className="admin-stat-card admin-stat-card-mindmap"><span>Total Record</span><p>{stats?.totals.records ?? 0}</p></article>
            <article className="admin-stat-card admin-stat-card-mindmap"><span>Pengguna</span><p>{stats?.totals.users ?? 0}</p></article>
            <article className="admin-stat-card admin-stat-card-mindmap"><span>Pengaduan</span><p>{stats?.totals.complaints ?? 0}</p></article>
          </section>

          <section className="admin-panel admin-panel-mindmap">
            <div className="admin-panel-head">
              <div>
                <p className="admin-panel-eyebrow">{currentGroupTitle}</p>
                <h2>{selectedTableMeta?.label ?? 'Pilih modul tabel'}</h2>
                <p>{currentGroupDescription}</p>
              </div>
              <form
                className="admin-actions"
                onSubmit={(event) => {
                  event.preventDefault()
                  handleSearch()
                }}
              >
                <label className="admin-search" htmlFor="tableSearch">
                  <input
                    id="tableSearch"
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Cari data di tabel ini..."
                    aria-label="Cari data pada tabel"
                  />
                </label>
                <button type="submit" className="admin-btn secondary">Cari</button>
                <button type="button" className="admin-btn secondary" onClick={handleClearSearch} disabled={!searchInput && !activeSearch}>
                  Reset
                </button>
                <button type="button" className="admin-btn primary" onClick={handleOpenCreate}>+ Tambah</button>
              </form>
            </div>

            {error && <p className="admin-alert error">{error}</p>}
            {message && <p className="admin-alert success">{message}</p>}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    {tableColumns.map((column) => (
                      <th key={column}>{prettyLabel(column)}</th>
                    ))}
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const rowId = Number(row.id)

                    return (
                      <tr key={Number.isFinite(rowId) ? rowId : JSON.stringify(row)}>
                        <td>{formatValue(row.id)}</td>
                        {tableColumns.map((column) => (
                          <td key={`${String(row.id)}-${column}`}>{formatValue(row[column])}</td>
                        ))}
                        <td>
                          <div className="admin-row-actions">
                            <button type="button" className="admin-btn inline" onClick={() => handleEdit(row)}>Edit</button>
                            <button
                              type="button"
                              className="admin-btn inline danger"
                              onClick={() => Number.isFinite(rowId) && handleDelete(rowId)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {!isLoading && rows.length === 0 && (
                    <tr>
                      <td colSpan={tableColumns.length + 2} className="admin-empty-row">
                        Tidak ada data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <button
                type="button"
                className="admin-btn secondary"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => void loadRows(selectedTable, currentPage - 1, activeSearch)}
              >
                Prev
              </button>
              <span>Halaman {currentPage} / {lastPage}</span>
              <button
                type="button"
                className="admin-btn secondary"
                disabled={currentPage >= lastPage || isLoading}
                onClick={() => void loadRows(selectedTable, currentPage + 1, activeSearch)}
              >
                Next
              </button>
            </div>
          </section>

          {isFormOpen && (
            <section className="admin-panel admin-panel-mindmap" ref={formSectionRef}>
              <div className="admin-panel-head">
                <div>
                  <p className="admin-panel-eyebrow">{editingId ? 'Mode edit aktif' : 'Mode tambah aktif'}</p>
                  <h2>{editingId ? 'Edit Data' : 'Tambah Data Baru'}</h2>
                </div>
                <button type="button" className="admin-btn secondary" onClick={() => setIsFormOpen(false)}>Tutup</button>
              </div>

              <form className="admin-form-grid" onSubmit={handleSubmit}>
                {editableColumns.map((column) => {
                  const isEnum = column.enumOptions.length > 0
                  const isRole = column.name === 'role'

                  return (
                    <label key={column.name} className="admin-field">
                      <span>
                        {prettyLabel(column.name)}
                        {!column.nullable && <em>*</em>}
                      </span>

                      {isRole || isEnum ? (
                        <select
                          value={formData[column.name] ?? ''}
                          onChange={(event) =>
                            setFormData((prev) => ({
                              ...prev,
                              [column.name]: event.target.value,
                            }))
                          }
                        >
                          <option value="">Pilih Role</option>
                          {isRole ? (
                            roleOptions.map((option) => (
                              <option key={option.code} value={option.code} title={option.description ?? undefined}>
                                {option.label}
                              </option>
                            ))
                          ) : (
                            column.enumOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))
                          )}
                        </select>
                      ) : (
                        <input
                          type={column.dataType === 'date' ? 'date' : 'text'}
                          value={formData[column.name] ?? ''}
                          onChange={(event) =>
                            setFormData((prev) => ({
                              ...prev,
                              [column.name]: event.target.value,
                            }))
                          }
                          placeholder={column.default ?? `Isi ${prettyLabel(column.name)}`}
                        />
                      )}
                    </label>
                  )
                })}

                <button type="submit" className="admin-btn primary" disabled={isSaving}>
                  {isSaving ? 'Menyimpan...' : editingId ? 'Update Data' : 'Simpan Data'}
                </button>
              </form>
            </section>
          )}

          {!isLoading && selectedTableMeta && (
            <section className="admin-panel admin-panel-note">
              <div className="admin-panel-head">
                <div>
                  <p className="admin-panel-eyebrow">Informasi Modul</p>
                  <h2>{selectedTableMeta.label}</h2>
                </div>
              </div>
              <p className="admin-module-copy">
                {selectedGroup?.description ?? 'Gunakan panel ini untuk mengelola data yang dipilih.'}
              </p>
              <p className="admin-module-copy muted">Total data ditemukan: {totalRows}</p>
            </section>
          )}
        </section>
      </div>
    </main>
  )
}
