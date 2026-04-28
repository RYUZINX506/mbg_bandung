import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SekolahPanelPage from './SekolahPanelPage'
import SppgPanelPage from './SppgPanelPage'

export default function RolePanelPage() {
  const { role } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!role) {
      navigate('/panel')
      return
    }

    if (role !== 'sekolah' && role !== 'sppg') {
      navigate('/panel')
    }
  }, [role, navigate])

  if (role === 'sekolah') {
    return <SekolahPanelPage />
  }

  if (role === 'sppg') {
    return <SppgPanelPage />
  }

  return null
}
