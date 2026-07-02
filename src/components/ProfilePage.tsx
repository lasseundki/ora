import { useAuth } from '../contexts/AuthContext'
import { useActivity } from '../hooks/useActivity'
import { YearGrid } from './YearGrid'
import type { StreakData } from '../hooks/useStreak'

interface Props {
  streak: StreakData
}

export function ProfilePage({ streak }: Props) {
  const { user, logout } = useAuth()
  const activity = useActivity(user)

  return (
    <div className="min-h-screen bg-[#f8f4ee]">
      <div className="h-1 w-full bg-stone-300" />
      <div className="max-w-xl mx-auto px-6 py-10">

        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-1">
          Profil
        </p>
        <h1 className="font-serif text-2xl text-stone-800 mb-8">
          {user?.displayName ?? user?.email ?? 'Mein Konto'}
        </h1>

        {/* Streak */}
        <section className="bg-white/60 border border-stone-200 rounded-lg px-6 py-5 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3">
            Serie
          </p>
          <div className="flex gap-8 mb-1">
            <div className="text-center">
              <p className="font-serif text-4xl text-stone-800">{streak.current}</p>
              <p className="font-serif text-xs text-stone-400 mt-1">Tage in Folge</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-4xl text-stone-500">{streak.longest}</p>
              <p className="font-serif text-xs text-stone-400 mt-1">Längste Serie</p>
            </div>
          </div>
        </section>

        {/* Jahresraster */}
        <section className="bg-white/60 border border-stone-200 rounded-lg px-6 py-5 mb-5 overflow-x-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">
            Jahresübersicht
          </p>
          <YearGrid activity={activity} />
        </section>

        {/* Konto */}
        <section className="bg-white/60 border border-stone-200 rounded-lg px-6 py-5 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3">
            Konto
          </p>
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
