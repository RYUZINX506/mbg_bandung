import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../config/api'
import '../../styles/AdminPanelPage.css'

export type CrudTableConfig = {
  name: string
  label: string
  description: string
  note?: string
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
}

export type CrudGroupConfig = {
  key: string
  title: string
  description: string
  tables: CrudTableConfig[]
}

type TableSchemaColumn = {
  name: string
  dataType: string
  columnType: string
  nullable: boolean
  default: string | null
  extra: string
  enumOptions: string[]
}

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

type AdminSchemaResponse = {
  data: Array<{
    name: string
    label: string
    rowCount: number
    primaryKey: string
    columns: TableSchemaColumn[]
  }>
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

type DatabaseCrudPanelProps = {
  brand: string
  version: string
  kicker: string
  title: string
  subtitle: string
  tags: string[]
  variant: 'mindmap' | 'superadmin'
  groups: CrudGroupConfig[]
  defaultTable?: string
  loginPath: string
  signOutPath: string
  redirectPath?: string
  emptyStateTitle?: string
}

const readableLabel = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const formatCellValue = (value: unknown) => {
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

const isReadonlyColumn = (columnName: string) =>
  ['id', 'created_at', 'updated_at', 'deleted_at'].includes(columnName)

const getInputType = (column: TableSchemaColumn) => {
  if (column.enumOptions.length > 0) {
    return 'select'
  }

  if (/date|time/i.test(column.dataType) || /date|time/i.test(column.columnType)) {
    return 'date'
  }

  if (/int|decimal|float|double|numeric/i.test(column.dataType)) {
    return 'number'
  }

  if (/text|longtext|mediumtext/i.test(column.dataType)) {
    return 'textarea'
  }

  if (/email/i.test(column.name)) {
    return 'email'
  }

  if (/password/i.test(column.name)) {
    return 'password'
  }

  return 'text'
}

export default function DatabaseCrudPanel({
  brand,
  version,
  kicker,
  title,
  subtitle,
  tags,
  variant,
  groups,
  defaultTable,
  loginPath,
  signOutPath,
  redirectPath,
  emptyStateTitle = 'Memuat panel...',
}: DatabaseCrudPanelProps) {
  const navigate = useNavigate()
  const token = localStorage.getItem('mbg_token')
  const role = localStorage.getItem('mbg_role')

  const [stats, setStats] = useState<AdminStatsResponse['data'] | null>(null)
  const [schemas, setSchemas] = useState<AdminSchemaResponse['data']>([])
  const [selectedGroupKey, setSelectedGroupKey] = useState(groups[0]?.key ?? '')
  const [selectedTable, setSelectedTable] = useState(defaultTable ?? '')
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([])
  const [searchDraft, setSearchDraft] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingRows, setLoadingRows] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showSummaryModal, setShowSummaryModal] = useState(false)

  const availableGroups = useMemo(() => {
    const availableTableNames = new Set(schemas.map((schema) => schema.name))

    return groups
      .map((group) => ({
        ...group,
        tables: group.tables.filter((table) => availableTableNames.has(table.name)),
      }))
      .filter((group) => group.tables.length > 0)
  }, [groups, schemas])

  const selectedGroup = useMemo(
    () => availableGroups.find((group) => group.key === selectedGroupKey) ?? availableGroups[0] ?? null,
    [availableGroups, selectedGroupKey],
  )

  const selectedTableMeta = useMemo(
    () => schemas.find((schema) => schema.name === selectedTable) ?? null,
    [schemas, selectedTable],
  )

  const selectedTableConfig = useMemo(
    () => selectedGroup?.tables.find((table) => table.name === selectedTable) ?? null,
    [selectedGroup, selectedTable],
  )

  const isDeletionRequestTable = selectedTable === 'admin_deletion_requests'
  const canCreateSelectedTable = selectedTableConfig?.canCreate ?? true
  const canUpdateSelectedTable = selectedTableConfig?.canUpdate ?? true
  const canDeleteSelectedTable = selectedTableConfig?.canDelete ?? true
  const hasStandardRowActions = (canUpdateSelectedTable || canDeleteSelectedTable) && ! isDeletionRequestTable
  const canReviewDeletionRequests = isDeletionRequestTable && variant === 'superadmin'

  const editableColumns = useMemo(
    () => selectedTableMeta?.columns.filter((column) => !isReadonlyColumn(column.name) && !column.extra.includes('auto_increment')) ?? [],
    [selectedTableMeta],
  )

  const tableColumns = useMemo(() => {
    if (!selectedTableMeta) {
      return [] as string[]
    }

    const preferred = isDeletionRequestTable
      ? ['status', 'table_name', 'record_id', 'requested_by_role']
      : ['name', 'nama', 'title', 'kode', 'status', 'role']
    const available = selectedTableMeta.columns.map((column) => column.name).filter((name) => !isReadonlyColumn(name))
    const picked = preferred.filter((column) => available.includes(column))

    if (picked.length > 0) {
      return picked.slice(0, 3)
    }

    return available.slice(0, 3)
  }, [isDeletionRequestTable, selectedTableMeta])

  const resetForm = () => {
    const nextFormData: Record<string, string> = {}

    editableColumns.forEach((column) => {
      nextFormData[column.name] = ''
    })

    setFormData(nextFormData)
    setEditingId(null)
  }

  const loadRows = async (tableName: string, page: number, search: string) => {
    if (!token || !tableName) {
      return
    }

    setLoadingRows(true)

    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: '10',
      })

      if (search.trim()) {
        params.set('search', search.trim())
      }

      const response = await apiRequest<AdminRowsResponse>(`/admin/rows/${tableName}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setRows(response.data)
      setCurrentPage(response.meta.currentPage)
      setLastPage(response.meta.lastPage)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Data tabel gagal dimuat.')
    } finally {
      setLoadingRows(false)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate(loginPath, { replace: true })
      return
    }

    if (role === 'superadmin' && variant === 'mindmap') {
      navigate(redirectPath ?? '/admin', { replace: true })
      return
    }

    if (role === 'admin' && variant === 'superadmin') {
      navigate(redirectPath ?? '/admin-dashboard', { replace: true })
      return
    }

    const bootstrap = async () => {
      setLoading(true)
      setError('')

      try {
        const [statsResponse, schemaResponse] = await Promise.all([
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
        ])

        setStats(statsResponse.data)
        setSchemas(schemaResponse.data)

        const availableTableNames = new Set(schemaResponse.data.map((schema) => schema.name))
        const preferredTable = defaultTable && availableTableNames.has(defaultTable) ? defaultTable : ''
        const firstGroup = groups.find((group) => group.tables.some((table) => availableTableNames.has(table.name)))
        const firstTable = preferredTable
          || firstGroup?.tables.find((table) => availableTableNames.has(table.name))?.name
          || schemaResponse.data[0]?.name
          || ''

        setSelectedGroupKey(firstGroup?.key ?? groups[0]?.key ?? '')
        setSelectedTable(firstTable)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Panel gagal dimuat.')
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [defaultTable, groups, loginPath, navigate, redirectPath, role, token, variant])

  useEffect(() => {
    if (!selectedTable) {
      return
    }

    setSearchDraft('')
    setActiveSearch('')
    setCurrentPage(1)
    setMessage('')
    setError('')
    resetForm()
    setIsFormOpen(false)
    void loadRows(selectedTable, 1, '')
  }, [selectedTable])

  useEffect(() => {
    if (!selectedGroup) {
      return
    }

    if (!selectedGroup.tables.some((table) => table.name === selectedTable)) {
      const nextTable = selectedGroup.tables[0]?.name ?? ''
      setSelectedTable(nextTable)
    }
  }, [selectedGroup, selectedTable])

  useEffect(() => {
    if (!isFormOpen) {
      return
    }
  }, [isFormOpen])

  const openCreateForm = () => {
    if (!canCreateSelectedTable || canReviewDeletionRequests) {
      return
    }

    resetForm()
    setIsFormOpen(true)
    setMessage('')
    setError('')
  }

  const openEditForm = (row: Record<string, unknown>) => {
    if (!canUpdateSelectedTable || canReviewDeletionRequests) {
      return
    }

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
  }

  const handleDelete = async (id: number) => {
    if (!token || !selectedTable || !canDeleteSelectedTable || canReviewDeletionRequests) {
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
      await loadRows(selectedTable, currentPage, activeSearch)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menghapus data.')
    }
  }

  const handleDeletionRequestDecision = async (id: number, status: 'approved' | 'rejected') => {
    if (!token || !isDeletionRequestTable || !canReviewDeletionRequests) {
      return
    }

    setError('')
    setMessage('')

    try {
      const response = await apiRequest<AdminMutationResponse>(`/admin/rows/${selectedTable}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { status } }),
      })

      setMessage(response.message)
      await loadRows(selectedTable, currentPage, activeSearch)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal memproses permintaan hapus.')
    }
  }

  const handleSearch = () => {
    setActiveSearch(searchDraft)
    void loadRows(selectedTable, 1, searchDraft)
  }

  const handleClearSearch = () => {
    setSearchDraft('')
    setActiveSearch('')
    void loadRows(selectedTable, 1, '')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token || !selectedTable || !canCreateSelectedTable && !canUpdateSelectedTable) {
      return
    }

    if (canReviewDeletionRequests) {
      return
    }

    setSaving(true)
    setMessage('')
    setError('')

    try {
      const endpoint = editingId ? `/admin/rows/${selectedTable}/${editingId}` : `/admin/rows/${selectedTable}`

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
      await loadRows(selectedTable, currentPage, activeSearch)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  const statsCards = [
    { label: 'Jumlah Tabel', value: stats?.totals.tables ?? 0 },
    { label: 'Total Record', value: stats?.totals.records ?? 0 },
    { label: 'Pengguna', value: stats?.totals.users ?? 0 },
    { label: 'Pengaduan', value: stats?.totals.complaints ?? 0 },
  ]

  const currentGroupTitle = selectedGroup?.title ?? 'Pilih modul'
  const currentGroupDescription = selectedGroup?.description ?? 'Pilih tabel untuk mulai mengelola data.'
  const showFormPanel = (canCreateSelectedTable || canUpdateSelectedTable) && ! canReviewDeletionRequests
  const showRowActions = hasStandardRowActions || canReviewDeletionRequests

  if (loading && !stats) {
    return (
      <main className={`admin-page admin-page-${variant}`}>
        <div className={`admin-layout admin-layout-${variant}`}>
          <aside className={`admin-sidebar admin-sidebar-${variant}`}>
            <div>
              <div className="admin-brand">{brand}</div>
              <div className="admin-version">{version}</div>
            </div>
          </aside>
          <section className={`admin-main admin-main-${variant}`}>
            <section className="admin-panel admin-panel-mindmap">
              <div className="admin-empty-state">{emptyStateTitle}</div>
            </section>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className={`admin-page admin-page-${variant}`}>
      <div className={`admin-layout admin-layout-${variant}`}>
        <aside className={`admin-sidebar admin-sidebar-${variant}`}>
          <div>
            <div className="admin-brand">{brand}</div>
            <div className="admin-version">{version}</div>

            <nav className={`admin-nav admin-nav-${variant}`} aria-label="Navigasi modul admin">
              {availableGroups.map((group) => (
                <div key={group.key} className="admin-group">
                  <div className="admin-group-title">{group.title}</div>
                  <div className="admin-group-description">{group.description}</div>
                  <div className="admin-group-list">
                    {group.tables.map((table) => (
                      <button
                        key={table.name}
                        type="button"
                        className={`admin-nav-item ${selectedTable === table.name ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedGroupKey(group.key)
                          setSelectedTable(table.name)
                        }}
                      >
                        <span>{table.label}</span>
                        <small>{schemaTableCount(stats?.tableCounts?.[table.name] ?? 0)}</small>
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
                window.location.href = signOutPath
              }}
            >
              Sign Out
            </button>
          </div>
        </aside>

        <section className={`admin-main admin-main-${variant}`}>
          <header className={`admin-topbar admin-topbar-${variant}`}>
            <div>
              <p className="admin-kicker">{kicker}</p>
              <h1>{title}</h1>
              <p className="admin-topbar-subtitle">{subtitle}</p>
            </div>
            <div className="admin-topbar-tags">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </header>

          <section className={`admin-stats-grid admin-stats-grid-${variant}`} aria-label="Ringkasan admin">
            {statsCards.map((card) => (
              <article key={card.label} className="admin-stat-card admin-stat-card-mindmap">
                <span>{card.label}</span>
                <p>{card.value}</p>
              </article>
            ))}
          </section>

          <section className="admin-mindmap-grid">
            <article className="admin-panel admin-panel-hero">
              <div className="admin-panel-head">
                <div>
                  <p className="admin-panel-eyebrow">{currentGroupTitle}</p>
                  <h2>{selectedTableMeta?.label ?? 'Pilih tabel'}</h2>
                  <p>{currentGroupDescription}</p>
                </div>

                <form
                  className="admin-actions"
                  onSubmit={(event) => {
                    event.preventDefault()
                    handleSearch()
                  }}
                >
                  <label className="admin-search" htmlFor={`tableSearch-${variant}`}>
                    <input
                      id={`tableSearch-${variant}`}
                      type="search"
                      value={searchDraft}
                      onChange={(event) => setSearchDraft(event.target.value)}
                      placeholder="Cari data pada tabel ini..."
                      aria-label="Cari data pada tabel"
                    />
                  </label>
                  <button type="submit" className="admin-btn secondary">Cari</button>
                  <button type="button" className="admin-btn secondary" onClick={handleClearSearch} disabled={!searchDraft && !activeSearch}>
                    Reset
                  </button>
                  {canCreateSelectedTable && ! canReviewDeletionRequests && (
                    <button type="button" className="admin-btn primary" onClick={openCreateForm}>+ Tambah</button>
                  )}
                  <button type="button" className="admin-btn secondary" onClick={() => setShowSummaryModal(true)}>Ringkasan Modul</button>
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
                        <th key={column}>{readableLabel(column)}</th>
                      ))}
                      {showRowActions && <th>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingRows ? (
                      <tr>
                        <td colSpan={tableColumns.length + (showRowActions ? 2 : 1)} className="admin-empty-row">Memuat data...</td>
                      </tr>
                    ) : rows.length > 0 ? rows.map((row) => {
                      const rowId = Number(row.id)
                      const requestStatus = String(row.status ?? '').toLowerCase()

                      return (
                        <tr key={Number.isFinite(rowId) ? rowId : JSON.stringify(row)}>
                          <td>{formatCellValue(row.id)}</td>
                          {tableColumns.map((column) => (
                            <td key={`${String(row.id)}-${column}`}>{formatCellValue(row[column])}</td>
                          ))}
                          {showRowActions && (
                            <td>
                              <div className="admin-row-actions">
                                {canReviewDeletionRequests ? (
                                  requestStatus === 'pending' ? (
                                    <>
                                      <button
                                        type="button"
                                        className="admin-btn inline"
                                        onClick={() => Number.isFinite(rowId) && handleDeletionRequestDecision(rowId, 'approved')}
                                      >
                                        Setujui
                                      </button>
                                      <button
                                        type="button"
                                        className="admin-btn inline danger"
                                        onClick={() => Number.isFinite(rowId) && handleDeletionRequestDecision(rowId, 'rejected')}
                                      >
                                        Tolak
                                      </button>
                                    </>
                                  ) : (
                                    <span className="admin-row-status">{requestStatus || 'processed'}</span>
                                  )
                                ) : (
                                  <>
                                    {canUpdateSelectedTable && (
                                      <button type="button" className="admin-btn inline" onClick={() => openEditForm(row)}>Lihat</button>
                                    )}
                                    {canDeleteSelectedTable && variant !== 'superadmin' && (
                                      <button
                                        type="button"
                                        className="admin-btn inline danger"
                                        onClick={() => Number.isFinite(rowId) && handleDelete(rowId)}
                                      >
                                        Hapus
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    }) : (
                      <tr>
                        <td colSpan={tableColumns.length + (showRowActions ? 2 : 1)} className="admin-empty-row">
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
                  disabled={currentPage <= 1 || loadingRows}
                  onClick={() => void loadRows(selectedTable, currentPage - 1, activeSearch)}
                >
                  Prev
                </button>
                <span>Halaman {currentPage} / {lastPage}</span>
                <button
                  type="button"
                  className="admin-btn secondary"
                  disabled={currentPage >= lastPage || loadingRows}
                  onClick={() => void loadRows(selectedTable, currentPage + 1, activeSearch)}
                >
                  Next
                </button>
              </div>
            </article>

            {isFormOpen && showFormPanel && (
              <div className="admin-modal-backdrop" onClick={() => { setIsFormOpen(false); resetForm() }}>
                <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
                  <div className="admin-panel-head">
                    <div>
                      <p className="admin-panel-eyebrow">{editingId ? 'Mode edit aktif' : 'Mode tambah aktif'}</p>
                      <h2>{editingId ? 'Edit Data' : 'Tambah Data Baru'}</h2>
                    </div>
                    <button type="button" className="admin-btn secondary" onClick={() => { setIsFormOpen(false); resetForm() }}>Tutup</button>
                  </div>

                  <form className="admin-form-grid" onSubmit={handleSubmit}>
                    {editableColumns.map((column) => {
                      const inputType = getInputType(column)

                      return (
                        <label key={column.name} className="admin-field">
                          <span>
                            {readableLabel(column.name)}
                            {!column.nullable && <em>*</em>}
                          </span>

                          {inputType === 'select' ? (
                            <select
                              value={formData[column.name] ?? ''}
                              onChange={(event) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [column.name]: event.target.value,
                                }))
                              }
                            >
                              <option value="">Pilih {readableLabel(column.name)}</option>
                              {column.enumOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : inputType === 'textarea' ? (
                            <textarea
                              value={formData[column.name] ?? ''}
                              onChange={(event) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [column.name]: event.target.value,
                                }))
                              }
                              placeholder={column.default ?? `Isi ${readableLabel(column.name)}`}
                            />
                          ) : (
                            <input
                              type={inputType}
                              value={formData[column.name] ?? ''}
                              onChange={(event) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [column.name]: event.target.value,
                                }))
                              }
                              placeholder={column.default ?? `Isi ${readableLabel(column.name)}`}
                            />
                          )}
                        </label>
                      )
                    })}

                    <button type="submit" className="admin-btn primary" disabled={saving}>
                      {saving ? 'Menyimpan...' : editingId ? 'Update Data' : 'Simpan Data'}
                    </button>
                  </form>
                </div>
              </div>
            )}
            {showSummaryModal && (
              <div className="admin-modal-backdrop" onClick={() => setShowSummaryModal(false)}>
                <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="admin-panel-head">
                    <div>
                      <p className="admin-panel-eyebrow">Ringkasan Modul</p>
                      <h2>{currentGroupTitle}</h2>
                      <p className="admin-module-copy muted">{currentGroupDescription}</p>
                    </div>
                    <div>
                      <button type="button" className="admin-btn secondary" onClick={() => setShowSummaryModal(false)}>Tutup</button>
                    </div>
                  </div>

                  <div className="admin-mindmap-cards">
                    {selectedGroup?.tables.map((table) => (
                      <button
                        key={table.name}
                        type="button"
                        className="admin-mindmap-card"
                        onClick={() => {
                          setSelectedTable(table.name)
                          setSelectedGroupKey(selectedGroup.key)
                          setShowSummaryModal(false)
                        }}
                      >
                        <strong>{table.label}</strong>
                        <span>{table.description}</span>
                        <b>{schemaTableCount(stats?.tableCounts?.[table.name] ?? 0)}</b>
                        {table.note && <small>{table.note}</small>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}

function schemaTableCount(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  if (value < 0) {
    return 0
  }

  return value
}