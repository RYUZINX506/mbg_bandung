import Header from '../components/Header'
import Hero from '../components/Hero'
import Statistics from '../components/Statistics'
import Reports from '../components/Reports'
import '../styles/Reports.css'
const BANDUNG_MAP_URL = 'https://data-stagging2.bandung.go.id/'
import About from '../components/About'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Statistics />
      <div className="section-divider" aria-label="Live Dashboard">
        <span className="section-divider-pill">
          <span className="section-divider-dot" aria-hidden="true"></span>
          <span>Live Dashboard</span>
        </span>
      </div>
      <Reports />
      <section className="live-map-section" aria-label="Peta MBG Kota Bandung">
        <div className="live-map-head">
          <h2>Peta MBG Kota Bandung</h2>
          <a href={BANDUNG_MAP_URL} target="_blank" rel="noreferrer" className="live-map-open-link">Buka Web Map</a>
        </div>
        <p className="live-map-caption">Peta interaktif dari data-stagging2.bandung.go.id. Jika tidak tampil, klik "Buka Web Map".</p>
        <div className="live-map-frame-wrap">
          <iframe
            className="live-map-frame"
            title="Web Map MBG Kota Bandung"
            src={BANDUNG_MAP_URL}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
      <About />
      <Footer />
    </>
  )
}
