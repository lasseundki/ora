import { useState, useMemo } from 'react'
import { liturgicalDay } from './church-year'
import { useDayContent } from './hooks/useDayContent'
import { DayView } from './components/DayView'
import { LoginPage } from './components/LoginPage'
import { useAuth } from './contexts/AuthContext'

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

function AppInner() {
  const { user, loading, logout } = useAuth()
  const [date, setDate] = useState(() => new Date())

  const day         = useMemo(() => liturgicalDay(date), [date])
  const contentState = useDayContent(day?.contentId ?? '')

  if (loading) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center">
        <p className="text-violet-400 animate-pulse text-sm">Ora …</p>
      </div>
    )
  }

  if (!user) return <LoginPage />

  if (!day) return <p className="p-8 text-gray-500">Kirchenjahr-Berechnung fehlgeschlagen.</p>

  return (
    <DayView
      day={day}
      content={contentState.status === 'ok' ? contentState.data : null}
      loading={contentState.status === 'loading'}
      date={date}
      onPrev={() => setDate(d => addDays(d, -1))}
      onNext={() => setDate(d => addDays(d, 1))}
      onLogout={logout}
    />
  )
}

export default function App() {
  // AuthProvider wird in main.tsx gewrappt — hier nur AppInner
  return <AppInner />
}
