import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../config/api'
import '../../styles/LoginPage.css'

type LoginResponse = {
  message: string
  data?: {
    token?: string
    user?: {
      role?: string | null
    }
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined
  const [kodeAkun, setKodeAkun] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!kodeAkun.trim() || !password.trim()) {
      setErrorMessage('Kode akun dan kata sandi wajib diisi.')
      setSuccessMessage('')
      return
    }

    if (!recaptchaSiteKey) {
      setErrorMessage('reCAPTCHA belum dikonfigurasi. Tambahkan VITE_RECAPTCHA_SITE_KEY.')
      setSuccessMessage('')
      return
    }

    if (!captchaToken) {
      setErrorMessage('Silakan verifikasi captcha terlebih dahulu.')
      setSuccessMessage('')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response: LoginResponse = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          kode: kodeAkun.trim(),
          password,
          captchaToken,
        }),
      })

      const token = response.data?.token
      if (token) {
        localStorage.setItem('mbg_token', token)
      }

      const userRole = response.data?.user?.role ?? 'admin'
      localStorage.setItem('mbg_role', userRole)

      setSuccessMessage(response.message || 'Login berhasil. Mengarahkan ke panel...')
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
      navigate(
        userRole === 'superadmin'
          ? '/superadmin'
          : userRole === 'admin'
          ? '/admin-dashboard'
          : userRole === 'sekolah'
          ? '/panelsekolah'
          : userRole === 'sppg'
          ? '/panelsppg'
          : '/admin-dashboard'
      )
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login gagal.')
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <header className="login-header">
          <h1>Login</h1>
          <p>Silakan login untuk membuka dashboard panel.</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field" htmlFor="login-kode">
            Kode Akun
            <input
              id="login-kode"
              type="text"
              value={kodeAkun}
              onChange={(event) => setKodeAkun(event.target.value)}
              placeholder="Masukkan kode akun"
              autoComplete="username"
            />
          </label>

          <label className="login-field" htmlFor="login-password">
            Kata Sandi
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan kata sandi"
              autoComplete="current-password"
            />
          </label>

          

          {recaptchaSiteKey ? (
            <div className="login-captcha-wrap">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={recaptchaSiteKey}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
                onErrored={() => setCaptchaToken(null)}
              />
            </div>
          ) : (
            <p className="login-error">reCAPTCHA belum aktif. Set env VITE_RECAPTCHA_SITE_KEY.</p>
          )}

          {errorMessage && <p className="login-error">{errorMessage}</p>}
          {successMessage && <p className="login-success">{successMessage}</p>}

          <button
            type="submit"
            className="login-submit"
            disabled={isSubmitting || !recaptchaSiteKey || !captchaToken}
          >
            {isSubmitting ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>
      </section>
    </main>
  )
}
