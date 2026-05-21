import DatabaseCrudPanel, { type CrudGroupConfig } from './DatabaseCrudPanel'
import { adminMindmapSections } from './adminMindmap'

const adminGroups: CrudGroupConfig[] = adminMindmapSections.map((section) => {
  const seenTables = new Set<string>()

  return {
    key: section.key,
    title: section.title,
    description: section.description,
    tables: section.cards
      .filter((card) => Boolean(card.table))
      .filter((card) => {
        if (!card.table) {
          return false
        }

        if (seenTables.has(card.table)) {
          return false
        }

        seenTables.add(card.table)
        return true
      })
      .map((card) => ({
        name: card.table as string,
        label: card.label,
        description: card.description,
        note: card.note,
      })),
  }
})

export default function AdminDashboardPage() {
  return (
    <DatabaseCrudPanel
      brand="Admin MBG"
      version="User Admin"
      kicker="Panel Admin MBG"
      title="Admin Biasa"
      subtitle="Kelola data operasional, laporan, dan pengaduan dengan tampilan CRUD yang sederhana dan rapi."
      tags={['Operasional', 'CRUD', 'Monitoring']}
      variant="mindmap"
      groups={adminGroups}
      defaultTable="laporan_sekolah"
      loginPath="/login"
      signOutPath="/login"
      redirectPath="/admin-dashboard"
      emptyStateTitle="Memuat panel admin..."
    />
  )
}