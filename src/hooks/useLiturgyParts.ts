import { useEffect, useState } from 'react'
import type { LiturgyPart } from '../types/liturgy'

type State =
  | { status: 'loading' }
  | { status: 'ok'; data: LiturgyPart[] }
  | { status: 'error'; message: string }

export function useLiturgyParts(): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}content/liturgy/de.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<LiturgyPart[]>
      })
      .then(data => {
        if (cancelled) return
        setState({ status: 'ok', data: [...data].sort((a, b) => a.order - b.order) })
      })
      .catch(err => {
        if (!cancelled) setState({ status: 'error', message: String(err) })
      })
    return () => { cancelled = true }
  }, [])

  return state
}
