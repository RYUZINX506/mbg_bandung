import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { apiRequest } from '../config/api'
import '../styles/ContactPage.css'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Individu',
    target: '',
    category: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRoleChange = (role: string) => {
    setFormData({
      ...formData,
      role
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    apiRequest('/complaints', {
      method: 'POST',
      body: JSON.stringify(formData),
    }).then(() => {
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'Individu',
        target: '',
        category: '',
        message: ''
      })
      window.setTimeout(() => setSubmitted(false), 3000)
    })
  }

  return (
    <>
      <Header />
      <div className="contact-page">
        <div className="contact-container">
          <div className="contact-info-section">
            <h2>Informasi Kontak</h2>

            <div className="info-card">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <h3>Lokasi Kantor Pengaduan</h3>
                <p>SEKRETARIAT DAERAH KOTA BANDUNG</p>
                <p>Jl. Wastukencana No. 2</p>
                <p>Kota Bandung, Jawa Barat 40117</p>
                <p>
                  <a href="https://maps.google.com/?q=Jl.+Wastukencana+No.+2,+Bandung" target="_blank" rel="noopener noreferrer">
                    Lihat di Google Maps
                  </a>
                </p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">💬</div>
              <div className="info-content">
                <h3>WhatsApp</h3>
                <p>
                  <a href="https://wa.me/628112223334" target="_blank" rel="noopener noreferrer">
                    0811-2223-334
                  </a>
                </p>
                <p>Hanya menerima pesan WhatsApp</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">📧</div>
              <div className="info-content">
                <h3>Email</h3>
                <p>
                  <a href="mailto:mbg@bandung.go.id">
                    mbg@bandung.go.id
                  </a>
                </p>
                <p>Respon dalam 24 jam</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">🕒</div>
              <div className="info-content">
                <h3>Jam Operasional</h3>
                <p>Senin - Jumat: 08:00 - 17:00 WIB</p>
                <p>Sabtu: 08:00 - 12:00 WIB</p>
                <p>Minggu: Tutup</p>
              </div>
            </div>

            <div className="office-map-card">
              <h3>Peta Lokasi Kantor</h3>
              <p className="office-map-meta">Koordinat: -6.914744, 107.609810</p>
              <iframe
                className="office-map-frame"
                title="Peta Kantor Pengaduan MBG"
                src="https://www.google.com/maps?q=-6.914744,107.609810&z=16&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Kirim Pesan/Pengaduan</h2>

            {submitted && (
              <div className="success-message">
                ✓ Pesan Anda telah dikirim! Terima kasih telah menghubungi kami.
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-alert">
                Data Anda kami rahasiakan.
              </div>

              <div className="form-group">
                <label>Siapa yang melapor? *</label>
                <div className="role-options">
                  {['Individu', 'Pihak Sekolah', 'SPPG'].map(role => (
                    <button
                      type="button"
                      key={role}
                      className={`role-option ${formData.role === role ? 'active' : ''}`}
                      onClick={() => handleRoleChange(role)}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Nama Lengkap *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan nama lengkap Anda"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="contoh@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Nomor Telepon</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="target">Tujuan *</label>
                  <select
                    id="target"
                    name="target"
                    value={formData.target}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Tujuan</option>
                    <option value="sekolah">Sekolah</option>
                    <option value="sppg">SPPG</option>
                    <option value="kabupaten">Kabupaten</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Kategori *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="pengaduan">Pengaduan</option>
                    <option value="pertanyaan">Pertanyaan</option>
                    <option value="saran">Saran</option>
                    <option value="laporan">Laporan Teknis</option>
                  </select>
                </div>

                <div className="form-group full">
                  <label htmlFor="message">Pesan *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tulis pesan Anda di sini..."
                    rows={6}
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit">
                Kirim Pesan/Pengaduan
              </button>
            </form>
          </div>
        </div>

        <div className="contact-extras">
          <div className="cta-card">
            <div className="cta-pill">Layanan Aspirasi dan Pengaduan Online Rakyat (LAPOR!)</div>
            <h3>Ada kendala terkait MBG?</h3>
            <p>
              Sampaikan kendala atau keluhan melalui kanal resmi. Tim kami akan
              menindaklanjuti laporan Anda untuk perbaikan program.
            </p>
            <div className="cta-actions">
              <button className="btn-primary">Buat Pengaduan</button>
              <span className="cta-note">Respons cepat, transparan, dan terukur</span>
            </div>
          </div>
        </div>

        <div className="faq-section">
          <h2>Pertanyaan yang Sering Diajukan (FAQ)</h2>
          <div className="faq-grid">
            <div className="faq-card">
              <h4>Bagaimana cara mendaftarkan sekolah ke program ini?</h4>
              <p>
                Sekolah dapat mendaftar melalui formulir online atau menghubungi
                Dinas Pendidikan. Tim akan melakukan verifikasi dan evaluasi.
              </p>
            </div>
            <div className="faq-card">
              <h4>Apakah program ini gratis untuk sekolah?</h4>
              <p>
                Ya, program Makan Bergizi Gratis sepenuhnya gratis untuk sekolah
                terdaftar. Semua biaya operasional ditanggung pemerintah.
              </p>
            </div>
            <div className="faq-card">
              <h4>Bagaimana kualitas makanan yang disediakan?</h4>
              <p>
                Menu disusun oleh ahli gizi profesional sesuai standar kesehatan
                nasional dan kebutuhan nutrisi harian siswa.
              </p>
            </div>
            <div className="faq-card">
              <h4>Apakah ada monitoring kualitas program?</h4>
              <p>
                Ada. Monitoring berkala dilakukan terhadap kualitas makanan,
                kebersihan dapur, dan kepuasan siswa.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
