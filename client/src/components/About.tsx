import '../styles/About.css'

export default function About() {
  const about = [
    {
      id: 1,
      title: 'Misi',
      description: 'Mewujudkan generasi yang sehat, cerdas, dan berkarakter melalui pemenuhan gizi yang optimal.',
      icon: '🎯'
    },
    {
      id: 2,
      title: 'Tujuan',
      description: 'Mengurangi angka stunting, meningkatkan konsentrasi belajar, dan menciptakan kebiasaan makan sehat.',
      icon: '🏆'
    },
    {
      id: 3,
      title: 'Sasaran',
      description: 'Siswa di sekolah terpilih di Kota Bandung dengan prioritas wilayah yang membutuhkan.',
      icon: '👨‍👩‍👧‍👦'
    },
    {
      id: 4,
      title: 'Manfaat',
      description: 'Meningkatkan asupan gizi, mengurangi beban ekonomi keluarga, dan mendukung pertumbuhan optimal anak.',
      icon: '❤️'
    }
  ]

  return (
    <section id="tentang-program" className="about">
      <div className="section-shell">
        <div className="section-card">
          <div className="section-header">
            <span className="section-eyebrow">Tentang Program</span>
            <h2>Tentang Program Makan Bergizi Gratis</h2>
            <p>Program prioritas nasional Pemerintah Indonesia di bawah Presiden Prabowo Subianto untuk memastikan 82,9 juta anak Indonesia mendapat nutrisi berkualitas demi masa depan bangsa yang lebih sehat dan cerdas.</p>
          </div>

          <div className="about-grid">
            {about.map(item => (
              <div key={item.id} className="about-card">
                <div className="about-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>

          <div className="about-highlights">
            <div className="highlight-box">
              <h3>Program Nasional</h3>
              <p>Implementasi penuh di seluruh wilayah Indonesia dengan fokus khusus pada Kota Bandung</p>
            </div>
            <div className="highlight-box">
              <h3>Komitmen Pemerintah</h3>
              <p>Dukungan penuh dari pusat untuk memastikan kesuksesan program di tingkat daerah</p>
            </div>
            <div className="highlight-box">
              <h3>Monitoring Real-time</h3>
              <p>Sistem transparansi dan akuntabilitas melalui platform digital untuk setiap pelaksanaan program</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
