import { useState, useMemo } from 'react'
import { liturgicalDay } from './church-year'
import { useDayContent } from './hooks/useDayContent'
import { useStreak } from './hooks/useStreak'
import { DayView } from './components/DayView'
import { NotesPage } from './components/NotesPage'
import { ProfilePage } from './components/ProfilePage'
import { LoginPage } from './components/LoginPage'
import { useAuth } from './contexts/AuthContext'

type Tab = 'andacht' | 'notizen' | 'profil'

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

function AppInner() {
  const { user, loading } = useAuth()
  const [date, setDate] = useState(() => new Date())
  const [tab, setTab] = useState<Tab>('andacht')

  const day          = useMemo(() => liturgicalDay(date), [date])
  const contentState = useDayContent(day?.contentId ?? '')
  const streak       = useStreak(user)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f4ee] flex items-center justify-center">
        <p className="font-serif text-stone-400 animate-pulse text-sm italic">Ora …</p>
      </div>
    )
  }

  if (!user) return <LoginPage />

  if (!day) return (
    <div className="min-h-screen bg-[#f8f4ee] flex items-center justify-center">
      <p className="font-serif text-stone-500 p-8">Kirchenjahr-Berechnung fehlgeschlagen.</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f4ee]">
      {/* Page content */}
      <div className="flex-1 pb-16">
        {tab === 'andacht' && (
          <DayView
            day={day}
            content={contentState.status === 'ok' ? contentState.data : null}
            loading={contentState.status === 'loading'}
            date={date}
            onPrev={() => setDate(d => addDays(d, -1))}
            onNext={() => setDate(d => addDays(d, 1))}
          />
        )}
        {tab === 'notizen' && <NotesPage day={day} />}
        {tab === 'profil'  && <ProfilePage streak={streak} />}
      </div>

      {/* Tab bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#f8f4ee] border-t border-stone-200">
        <div className="max-w-xl mx-auto flex">
          {([
            { id: 'andacht', label: 'Andacht' },
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
  return <AppInner />
}
