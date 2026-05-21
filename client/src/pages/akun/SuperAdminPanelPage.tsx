import DatabaseCrudPanel, { type CrudGroupConfig } from './DatabaseCrudPanel'
import { getTableLabel, superadminTableGroups } from './adminMindmap'

const superadminGroups: CrudGroupConfig[] = superadminTableGroups.map((group) => ({
  key: group.key,
  title: group.title,
  description: group.description,
  tables: group.tables.map((tableName) => ({
    name: tableName,
    label: getTableLabel(tableName),
    description: `Kelola data ${getTableLabel(tableName).toLowerCase()}.`,
    canCreate: tableName !== 'admin_deletion_requests',
    canUpdate: tableName !== 'admin_deletion_requests',
    canDelete: tableName !== 'admin_deletion_requests',
    note: group.title,
  })),
}))

export default function SuperAdminPanelPage() {
  return (
    <DatabaseCrudPanel
      brand="Superadmin MBG"
      version="Database Modules"
      kicker="Panel Admin MBG"
      title="Superadmin"
      subtitle="Kelola master data, akun, dan seluruh tabel yang diizinkan lewat satu panel CRUD yang konsisten."
      tags={['CRUD', 'Master Data', 'Database']}
      variant="superadmin"
      groups={superadminGroups}
      defaultTable="users"
      loginPath="/login"
      signOutPath="/login"
      redirectPath="/admin-dashboard"
      emptyStateTitle="Memuat panel superadmin..."
    />
  )
}