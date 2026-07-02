import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { User } from 'firebase/auth'

export type ActivityMap = Record<string, number> // YYYY-MM-DD → 1 | 2 | 3

export function useActivity(user: User | null): ActivityMap {
  const [map, setMap] = useState<ActivityMap>({})

  useEffect(() => {
    if (!user) { setMap({}); return }
    const col = collection(db, 'users', user.uid, 'activity')
    getDocs(col).then(snap => {
      const m: ActivityMap = {}
      snap.forEach(doc => { m[doc.id] = (doc.data().level as number) ?? 1 })
      setMap(m)
    })
  }, [user?.uid])

  return map
}
