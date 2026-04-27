import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import bandungLogo from '../assets/bandunglogo.png'
import '../styles/Header.css'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-wrapper">
          <Link to="/" className="logo-section">
            <div className="logo">
              <img className="logo-img" src={bandungLogo} alt="Bandung Logo" />
            </div>
            <div className="logo-text">
              <h1>Makan Bergizi Gratis</h1>
              <p>Kota Bandung</p>
            </div>
          </Link>

          <button 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>

          <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
            <ul>
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-9.5z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Beranda</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/sekolah"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M4 9.5 12 5l8 4.5-8 4.5-8-4.5z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 12.5V19l5 2 5-2v-6.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Sekolah</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/kelompok"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="8" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="16.5" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path
                      d="M3.5 19c.6-3 3.2-5 6.5-5s5.9 2 6.5 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Kelompok</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/sppg"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M7 11h10M7 7h10M7 15h10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  <span>SPPG</span>
                </NavLink>
              </li>
              <li>
              </li>
              <li>
                <NavLink
                  to="/kontak"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M8 6c0-1.7 1.3-3 3-3s3 1.3 3 3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M6 10h12l-1.2 8.5A2 2 0 0 1 14.8 20H9.2a2 2 0 0 1-2-1.5L6 10z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                  <span>Kontak/Pengaduan</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="header-actions" />
        </div>
      </div>
    </header>
  )
}

