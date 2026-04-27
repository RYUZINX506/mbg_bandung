import Header from '../components/Header'
import Footer from '../components/Footer'
import '../styles/PolicyPage.css'

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <div className="policy-page">
        <div className="policy-header">
          <h1>Kebijakan Privasi</h1>
          <p>Terakhir diperbarui: 11 April 2026</p>
        </div>

        <div className="policy-container">
          <section className="policy-section">
            <h2>1. Pendahuluan</h2>
            <p>
              Pemerintah Kota Bandung ("kami", "kami", atau "Perusahaan") mengoperasikan situs web https://mbg.bandung.go.id/ 
              ("Situs"). Halaman ini menginformasikan kepada Anda tentang kebijakan privasi kami terkait pengumpulan, penggunaan, 
              dan pengungkapan data pribadi Anda ketika Anda menggunakan situs web kami dan opsi yang Anda miliki terkait dengan data tersebut.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Informasi yang Kami Kumpulkan</h2>
            <h3>2.1 Informasi yang Anda Berikan</h3>
            <p>Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, seperti:</p>
            <ul>
              <li>Nama dan informasi kontak (email, nomor telepon)</li>
              <li>Informasi pendaftaran sekolah/kelompok</li>
              <li>Data demografis dan informasi program</li>
              <li>Pesan dan pertanyaan yang Anda kirim kepada kami</li>
            </ul>

            <h3>2.2 Informasi yang Dikumpulkan Secara Otomatis</h3>
            <p>Ketika Anda menggunakan situs kami, kami secara otomatis mengumpulkan informasi tertentu tentang perangkat Anda:</p>
            <ul>
              <li>Jenis peramban dan versi</li>
              <li>Sistem operasi Anda</li>
              <li>Alamat IP Anda</li>
              <li>Halaman yang Anda kunjungi dan waktu yang dihabiskan</li>
              <li>Referrer URL dan perangkat lain yang serupa Informasi</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Cara Kami Menggunakan Informasi Anda</h2>
            <p>Kami menggunakan informasi yang dikumpulkan untuk berbagai tujuan:</p>
            <ul>
              <li>Menyediakan layanan program MBG dan dukungan pelanggan</li>
              <li>Memproses transaksi dan mengirimkan informasi terkait</li>
              <li>Mengirimkan pembaruan program, peringatan keamanan, dan pesan administratif</li>
              <li>Merespons pertanyaan dan komentar Anda</li>
              <li>Menganalisis penggunaan situs untuk meningkatkan layanan kami</li>
              <li>Melindungi hak, privasi, keselamatan, dan properti kami dan pengguna</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. Keamanan Data</h2>
            <p>
              Kami mengambil langkah-langkah yang wajar secara teknis dan organisasi untuk melindungi data pribadi Anda 
              terhadap akses yang tidak sah, perubahan, pengungkapan, atau penghancuran. Namun, tidak ada metode transmisi 
              melalui Internet atau metode penyimpanan elektronik yang 100% aman dan andal.
            </p>
          </section>

          <section className="policy-section">
            <h2>5. Ruang Lingkup Kebijakan Ini</h2>
            <p>
              Kebijakan privasi ini tidak berlaku untuk informasi yang dikumpulkan melalui saluran lain, seperti obrolan 
              telepon, komunikasi email tatap muka, atau komunikasi offline lainnya. Kami juga tidak mengendalikan praktik 
              privasi pihak ketiga.
            </p>
          </section>

          <section className="policy-section">
            <h2>6. Perubahan pada Kebijakan Privasi Ini</h2>
            <p>
              Kami dapat memperbarui kebijakan privasi kami dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan 
              dengan memposting kebijakan privasi baru di situs ini dan memperbarui tanggal "Terakhir Diperbarui" di atas.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. Hubungi Kami</h2>
            <p>Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami di:</p>
            <div className="contact-info-box">
              <p><strong>Email:</strong> info@sumedangkab.go.id</p>
              <p><strong>Telepon:</strong> +62 851-8224-5865</p>
              <p><strong>Alamat:</strong> Jl. Asia Afrika No.10, Pusat Kota, Kota Bandung, Jawa Barat 40112</p>
            </div>
          </section>

          <section className="policy-section">
            <h2>8. Perjanjian Penggunaan</h2>
            <p>
              Penggunaan situs ini juga diatur oleh Syarat dan Ketentuan kami. Silakan tinjau Syarat dan Ketentuan kami, 
              yang juga menata kebijakan privasi ini.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
