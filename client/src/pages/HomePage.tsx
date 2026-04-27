import Header from '../components/Header'
import Hero from '../components/Hero'
import Statistics from '../components/Statistics'
import Reports from '../components/Reports'
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
      <About />
      <Footer />
    </>
  )
}
