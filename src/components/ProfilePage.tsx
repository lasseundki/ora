import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { YearGrid } from './YearGrid'
import type { ActivityMap } from '../hooks/useActivity'
import type { FontSize } from '../hooks/useFontSize'

interface Props {
  activity: ActivityMap
  fontSize: FontSize
  onFontSize: (s: FontSize) => void
}

const FONT_LABELS: Record<number, string> = { 15: 'Klein', 17: 'Normal', 20: 'Groß' }

export function ProfilePage({ activity, fontSize, onFontSize }: Props) {
  const { user, logout } = useAuth()
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function installApp() {
    if (!installPrompt) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (installPrompt as any).prompt()
    setInstallPrompt(null)
  }

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches

  return (
    <div className="min-h-screen bg-[#f8f4ee]">
      <div className="h-1 w-full bg-stone-300" />
      <div className="max-w-xl mx-auto px-6 py-10">

        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-1">Profil</p>
        <h1 className="font-serif text-2xl text-stone-800 mb-8">
          {user?.displayName ?? user?.email ?? 'Mein Konto'}
        </h1>

        {/* Jahresraster — nur Heatmap, keine Streak-Zahlen */}
        <section className="bg-white/60 border border-stone-200 rounded-lg px-6 py-5 mb-5 overflow-x-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Jahresübersicht</p>
          <YearGrid activity={activity} />
        </section>

        {/* Schriftgröße */}
        <section className="bg-white/60 border border-stone-200 rounded-lg px-6 py-5 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3">Schriftgröße</p>
          <div className="flex gap-2">
            {([15, 17, 20] as FontSize[]).map(s => (
              <button
                key={s}
                onClick={() => onFontSize(s)}
                className={[
                  'flex-1 py-2 rounded font-serif text-sm transition-colors border',
                  fontSize === s
                    ? 'bg-stone-800 text-[#f8f4ee] border-stone-800'
                    : 'bg-transparent text-stone-500 border-stone-300 hover:border-stone-500',
                ].join(' ')}
              >
                {FONT_LABELS[s]}
              </button>
            ))}
          </div>
        </section>

        {/* App installieren */}
        {!isInStandaloneMode && !installed && (
          <section className="bg-white/60 border border-stone-200 rounded-lg px-6 py-5 mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3">App installieren</p>
            {installPrompt ? (
              <button
                onClick={installApp}
                className="font-serif text-sm text-stone-700 underline decoration-stone-300"
              >
                Zum Startbildschirm hinzufügen
              </button>
            ) : isIos ? (
              <p className="font-serif text-sm text-stone-500 italic leading-relaxed">
                Tippe auf das Teilen-Symbol{' '}
                <span className="not-italic">⎦</span> und wähle
                „Zum Home-Bildschirm".
              </p>
            ) : null}
          </section>
        )}

        {/* Konto */}
        <section className="bg-white/60 border border-stone-200 rounded-lg px-6 py-5 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3">Konto</p>
          <p className="font-serif text-sm text-stone-600">{user?.email}</p>
        </section>

        <button
          onClick={logout}
          className="font-serif text-sm text-stone-400 hover:text-stone-700 transition-colors underline decoration-stone-200"
        >
          Abmelden
        </button>

      </div>
    </div>
  )
}
