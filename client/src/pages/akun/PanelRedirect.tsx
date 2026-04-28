import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PRIVATE_LOGIN_PATH } from '../../config/privateRoutes'

export default function PanelRedirect() {
  const navigate = useNavigate()
  const token = localStorage.getItem('mbg_token')
  const role = localStorage.getItem('mbg_role')

  useEffect(() => {
    if (!token) {
      navigate(PRIVATE_LOGIN_PATH)
      return
    }

    if (role === 'admin') {
      navigate('/admin')
    } else if (role === 'sekolah') {
      navigate('/panelsekolah')
    } else if (role === 'sppg') {
      navigate('/panelsppg')
    } else {
      navigate('/dashboard')
    }
  }, [navigate, token, role])

  return null
}
