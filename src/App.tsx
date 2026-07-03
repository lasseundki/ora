import { useState, useMemo, useCallback, useRef } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from './lib/firebase'
import { liturgicalDay } from './church-year'
import { useDayContent } from './hooks/useDayContent'
import { useStreak } from './hooks/useStreak'
import { useActivity } from './hooks/useActivity'
import { useFontSize } from './hooks/useFontSize'
import { DayView } from './components/DayView'
import { WeekView } from './components/WeekView'
import { NotesPage } from './components/NotesPage'
import { ProfilePage } from './components/ProfilePage'
import { LoginPage } from './components/LoginPage'
import { OnboardingScreen } from './components/OnboardingScreen'
import { useAuth } from './contexts/AuthContext'

export type DayMode = 'morgen' | 'tag' | 'abend'

type Tab = 'andacht' | 'woche' | 'notizen' | 'profil'

const addDays  = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const todayIso = () => new Date().toISOString().slice(0, 10)

function countToLevel(count: number): number {
  if (count === 0) return 0
  if (count < 3)  return 1
  if (count < 6)  return 2
  return 3
}

function detectMode(): DayMode {
  const stored = localStorage.getItem('ora-mode') as DayMode | null
  if (stored === 'morgen' || stored === 'tag' || stored === 'abend') return stored
  const h = new Date().getHours()
  if (h < 11) return 'morgen'
  if (h < 18) return 'tag'
  return 'abend'
}

function UpdateBanner() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  if (!needRefresh) return null
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-stone-800 text-[#f8f4ee] px-4 py-2.5 flex items-center justify-between gap-4 shadow-lg">
      <p className="font-serif text-sm">Neue Version verfügbar</p>
      <button
        onClick={() => updateServiceWorker(true)}
        className="font-serif text-sm underline decoration-stone-400 whitespace-nowrap"
      >
        Jetzt aktualisieren
      </button>
    </div>
  )
}

function AppInner() {
  const { user, loading } = useAuth()
  const [date, setDate]       = useState(() => new Date())
  const [tab, setTab]         = useState<Tab>('andacht')
  const [mode, setMode]       = useState<DayMode>(detectMode)
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem('ora-onboarded'))

  const day          = useMemo(() => liturgicalDay(date), [date])
  const contentState = useDayContent(day?.contentId ?? '')
  const activity     = useActivity(user)
  const { size: fontSize, update: setFontSize } = useFontSize()

  // Streak weiterhin aktiv (schreibt tägliche Activity), aber nicht mehr angezeigt
  useStreak(user)

  const writtenLevel = useRef(0)

  const handleEngagement = useCallback(async (count: number) => {
    if (!user) return
    const newLevel = countToLevel(count)
    if (newLevel <= writtenLevel.current) return
    writtenLevel.current = newLevel
    const ref = doc(db, 'users', user.uid, 'activity', todayIso())
    await setDoc(ref, { level: newLevel, engagedSections: count }, { merge: true })
  }, [user])

  function toggleMode() {
    const cycle: Record<DayMode, DayMode> = { morgen: 'tag', tag: 'abend', abend: 'morgen' }
    const next = cycle[mode]
    setMode(next)
    localStorage.setItem('ora-mode', next)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f4ee] flex items-center justify-center">
        <p className="font-serif text-stone-400 animate-pulse text-sm italic">Ora …</p>
      </div>
    )
  }

  if (!user) return <LoginPage />

  if (!onboarded) return <OnboardingScreen onDone={() => setOnboarded(true)} />

  if (!day) return (
    <div className="min-h-screen bg-[#f8f4ee] flex items-center justify-center">
      <p className="font-serif text-stone-500 p-8">Kirchenjahr-Berechnung fehlgeschlagen.</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f4ee]">
      <div className="flex-1 pb-16">
        {tab === 'andacht' && (
          <DayView
            day={day}
            content={contentState.status === 'ok' ? contentState.data : null}
            loading={contentState.status === 'loading'}
            date={date}
            fontSize={fontSize}
            mode={mode}
            onPrev={() => setDate(d => addDays(d, -1))}
            onToggleMode={toggleMode}
            onEngagement={handleEngagement}
          />
        )}
        {tab === 'woche' && (
          <WeekView onSelectDay={d => { setDate(d); setTab('andacht') }} />
        )}
        {tab === 'notizen' && <NotesPage day={day} />}
        {tab === 'profil'  && (
          <ProfilePage
            activity={activity}
            fontSize={fontSize}
            onFontSize={setFontSize}
          />
        )}
      </div>

      <nav className="fixed bottom-0 inset-x-0 bg-[#f8f4ee] border-t border-stone-200">
        <div className="max-w-xl mx-auto flex">
          {([
            { id: 'andacht', label: 'Andacht' },
            { id: 'woche',   label: 'Woche'   },
            { id: 'notizen', label: 'Notizen' },
            { id: 'profil',  label: 'Profil'  },
          ] as { id: Tab; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                'flex-1 py-3 font-serif text-xs tracking-wide transition-colors',
                tab === id
                  ? 'text-stone-800 border-t-2 border-stone-700 -mt-px'
                  : 'text-stone-400 hover:text-stone-600',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <>
      <UpdateBanner />
      <AppInner />
    </>
  )
}
