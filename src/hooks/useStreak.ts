import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { User } from 'firebase/auth'

export interface StreakData {
  current: number
  longest: number
  lastDate: string | null
}

const today = () => new Date().toISOString().slice(0, 10)
const yesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function useStreak(user: User | null): StreakData {
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastDate: null })

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    const ref = doc(db, 'users', uid, 'streaks', 'data')

    async function tick() {
      const snap = await getDoc(ref)
      const now = today()
      const activityRef = doc(db, 'users', uid, 'activity', now)

      if (!snap.exists()) {
        const init = { current: 1, longest: 1, lastDate: now }
        await setDoc(ref, { ...init, updatedAt: serverTimestamp() })
        await setDoc(activityRef, { level: 1 }, { merge: true })
        setStreak(init)
        return
      }

      const data = snap.data() as StreakData & { updatedAt: unknown }
      if (data.lastDate === now) {
        setStreak({ current: data.current, longest: data.longest, lastDate: data.lastDate })
        return
      }

      const newCurrent = data.lastDate === yesterday() ? data.current + 1 : 1
      const newLongest = Math.max(newCurrent, data.longest ?? 0)
      const updated = { current: newCurrent, longest: newLongest, lastDate: now }
      await setDoc(ref, { ...updated, updatedAt: serverTimestamp() })
      await setDoc(activityRef, { level: 1 }, { merge: true })
      setStreak(updated)
    }

    tick()
  }, [user])

  return streak
}
