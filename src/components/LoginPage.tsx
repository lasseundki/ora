import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'login' | 'register'

export function LoginPage() {
  const { signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth()
  const [mode, setMode]       = useState<Mode>('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [busy, setBusy]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') await signInWithEmail(email, password)
      else                  await registerWithEmail(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setBusy(true)
    try { await signInWithGoogle() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Unbekannter Fehler') }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo / Wortmarke */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-violet-800">Ora</h1>
          <p className="text-sm text-gray-500 mt-1">Tägliche lutherische Andacht</p>
        </div>

        {/* Google-Login */}
        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 mb-4 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Mit Google anmelden
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-violet-50 px-2">oder</span>
          </div>
        </div>

        {/* E-Mail-Login */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="E-Mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
          />
          <input
            type="password"
            required
            placeholder="Passwort"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-violet-700 hover:bg-violet-800 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {busy ? '…' : mode === 'login' ? 'Anmelden' : 'Registrieren'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          {mode === 'login' ? 'Noch kein Konto?' : 'Bereits registriert?'}{' '}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null) }}
            className="text-violet-700 underline"
          >
            {mode === 'login' ? 'Registrieren' : 'Anmelden'}
          </button>
        </p>
      </div>
    </div>
  )
}
