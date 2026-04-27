import { useEffect, useState } from 'react'
import '../styles/Hero.css'
import heroOne from '../assets/hero/1.jpg'
import heroTwo from '../assets/hero/2.jpg'
import heroThree from '../assets/hero/3.jpg'
import { apiRequest, type HomeResponse } from '../config/api'

export default function Hero() {
  const [summary, setSummary] = useState<{ target: number; realisasi: number }>({ target: 0, realisasi: 0 })

  useEffect(() => {
    apiRequest<HomeResponse>('/home')
      .then((response) => {
        const totalSchools = response.data.summary.sekolah || 0
        const totalSppg = response.data.summary.sppg || 0
        const totalReceived = response.data.topSchools.reduce((total, item) => total + item.siswa, 0)
        setSummary({
          target: totalSchools + totalSppg,
          realisasi: totalReceived,
        })
      })
      .catch(() => {
        setSummary({ target: 0, realisasi: 0 })
      })
  }, [])

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h2>Program Nasional Presiden RI</h2>
          <p>Platform monitoring dan pelaporan Program Makan Bergizi Gratis di Kota Bandung</p>
          <div className="hero-stats">
            <div className="hero-cards" aria-label="Target dan realisasi Kota Bandung">
              <div className="hero-card">
                <span className="hero-card-title">Target Kota Bandung</span>
                <span className="hero-card-value">{summary.target.toLocaleString('id-ID')}</span>
                <span className="hero-card-caption">Siswa penerima</span>
              </div>
              <div className="hero-card">
                <span className="hero-card-title">Realisasi Kota Bandung</span>
                <span className="hero-card-value">{summary.realisasi.toLocaleString('id-ID')}</span>
                <span className="hero-card-caption">Siswa penerima</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-image hero-slider" aria-label="Program ilustrasi">
          {[heroOne, heroTwo, heroThree].map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Ilustrasi program ${index + 1}`}
              className={`hero-slide slide-${index + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="hero-search">
        <div className="hero-search-shell">
          <input
            type="text"
            placeholder="Cari nama sekolah, kecamatan, atau alamat..."
            className="hero-search-input"
          />
          <span className="hero-live-pill">
            <span className="hero-live-dot"></span>
            Live
          </span>
          <button type="button" className="hero-search-btn">Enter</button>
        </div>
      </div>
    </section>
  )
}
