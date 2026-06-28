import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'login' | 'register'

export function LoginPage() {
  const { signInWithEmail, registerWithEmail } = useAuth()
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

  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo / Wortmarke */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-violet-800">Ora</h1>
          <p className="text-sm text-gray-500 mt-1">Tägliche lutherische Andacht</p>
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
