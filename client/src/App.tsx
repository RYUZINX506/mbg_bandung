import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SearchSchoolsPage from './pages/sekolah/SearchSchoolsPage'
import SchoolDetailPage from './pages/sekolah/SchoolDetailPage'
import SearchGroupsPage from './pages/kelompok/SearchGroupsPage'
import GroupDetailPage from './pages/kelompok/GroupDetailPage'
import SearchSPPGPage from './pages/sppg/SearchSPPGPage'
import SPPGDetailPage from './pages/sppg/SPPGDetailPage'
import ContactPage from './pages/ContactPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'

import AdminDashboardPage from './pages/akun/AdminDashboardPage'
import SuperAdminPanelPage from './pages/akun/SuperAdminPanelPage'
import RolePanelPage from './pages/akun/RolePanelPage'
import PanelRedirect from './pages/akun/PanelRedirect'
import SekolahPanelPage from './pages/akun/SekolahPanelPage'
import SppgPanelPage from './pages/akun/SppgPanelPage'
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
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/panel" element={<PanelRedirect />} />
        <Route path="/panel/:role" element={<RolePanelPage />} />
        <Route path="/admin" element={<SuperAdminPanelPage />} />
        <Route path="/panelsekolah" element={<SekolahPanelPage />} />
        <Route path="/panelsppg" element={<SppgPanelPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path={PRIVATE_LOGIN_PATH} element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

export default App
