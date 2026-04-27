import bandungLogo from '../assets/bandunglogo.png'
import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Makan Bergizi Gratis</h3>
            <p>Program prioritas nasional untuk memastikan anak Indonesia mendapat nutrisi berkualitas.</p>
            <div className="footer-logo">
              <img src={bandungLogo} alt="Logo Kota Bandung" />
            </div>
          </div>

          <div className="footer-section">
            <h4>Tautan</h4>
            <ul className="footer-links">
              <li><a href="#home">Beranda</a></li>
              <li><a href="#sekolah">Sekolah</a></li>
              <li><a href="#sppg">SPPG</a></li>
              <li><a href="#kontak">Kontak/Pengaduan</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Kontak</h4>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon" aria-hidden="true">L</span>
                <div>
                  <p className="contact-title">Lokasi</p>
                  <p>Jl. Angkrek No.103, Kota Bandung</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon" aria-hidden="true">W</span>
                <div>
                  <p className="contact-title">WhatsApp</p>
                  <p><a href="https://wa.me/6285182245865">085182245865</a></p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon" aria-hidden="true">E</span>
                <div>
                  <p className="contact-title">Email</p>
                  <p><a href="mailto:info@sumedangkab.go.id">info@sumedangkab.go.id</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">© 2025 Pemerintah Kota Bandung. Semua hak dilindungi.</p>
          <div className="footer-socials">
            <a href="#facebook" className="social-link" aria-label="Facebook">Fb</a>
            <a href="#twitter" className="social-link" aria-label="X">X</a>
            <a href="#instagram" className="social-link" aria-label="Instagram">Ig</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
