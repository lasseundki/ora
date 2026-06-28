import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'login' | 'register'

export function LoginPage() {
  const { signInWithEmail, registerWithEmail } = useAuth()
  const [mode, setMode]         = useState<Mode>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [busy, setBusy]         = useState(false)

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
    <div className="min-h-screen bg-[#f8f4ee] flex items-center justify-center p-6">
      <div className="w-full max-w-xs">

        {/* Wortmarke */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-stone-800 tracking-wide">Ora</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 mt-2">
            Tägliche Andacht
          </p>
        </div>

        {/* Formular */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="E-Mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-stone-300 rounded px-4 py-3 font-serif text-base bg-white/70 focus:outline-none focus:border-stone-500 text-stone-800 placeholder:text-stone-400"
          />
          <input
            type="password"
            required
            placeholder="Passwort"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-stone-300 rounded px-4 py-3 font-serif text-base bg-white/70 focus:outline-none focus:border-stone-500 text-stone-800 placeholder:text-stone-400"
          />
          {error && (
            <p className="font-serif text-red-700 text-sm italic">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-stone-800 hover:bg-stone-700 text-[#f8f4ee] font-serif text-base rounded px-4 py-3 transition-colors disabled:opacity-50 mt-1"
          >
            {busy ? '…' : mode === 'login' ? 'Anmelden' : 'Registrieren'}
          </button>
        </form>

        <p className="font-serif text-center text-sm text-stone-400 mt-5 italic">
          {mode === 'login' ? 'Noch kein Konto?' : 'Bereits registriert?'}{' '}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null) }}
            className="text-stone-600 underline decoration-stone-300"
          >
            {mode === 'login' ? 'Registrieren' : 'Anmelden'}
          </button>
        </p>

      </div>
    </div>
  )
}
