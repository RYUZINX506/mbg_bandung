import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SearchSchoolsPage from './pages/SearchSchoolsPage'
import SchoolDetailPage from './pages/SchoolDetailPage'
import SearchGroupsPage from './pages/SearchGroupsPage'
import GroupDetailPage from './pages/GroupDetailPage'
import SearchSPPGPage from './pages/SearchSPPGPage'
import SPPGDetailPage from './pages/SPPGDetailPage'
import ContactPage from './pages/ContactPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'

import AdminPanel from './pages/akun/AdminPanel'
import RolePanelPage from './pages/akun/RolePanelPage'
import PanelRedirect from './pages/akun/PanelRedirect'
import SekolahPanelPage from './pages/akun/SekolahPanelPage'
import SppgPanelPage from './pages/akun/SppgPanelPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/akun/LoginPage'
import { PRIVATE_LOGIN_PATH } from './config/privateRoutes'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sekolah" element={<SearchSchoolsPage />} />
        <Route path="/sekolah/:id" element={<SchoolDetailPage />} />
        <Route path="/kelompok" element={<SearchGroupsPage />} />
        <Route path="/kelompok/:id" element={<GroupDetailPage />} />
        <Route path="/sppg" element={<SearchSPPGPage />} />
        <Route path="/sppg/:id" element={<SPPGDetailPage />} />
        <Route path="/kontak" element={<ContactPage />} />
        <Route path="/privasi" element={<PrivacyPolicyPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/panel" element={<PanelRedirect />} />
        <Route path="/panel/:role" element={<RolePanelPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/panelsekolah" element={<SekolahPanelPage />} />
        <Route path="/panelsppg" element={<SppgPanelPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path={PRIVATE_LOGIN_PATH} element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

export default App
