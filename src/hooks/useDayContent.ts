import { useEffect, useState } from 'react'
import type { DayContent } from '../types/content'

type State =
  | { status: 'loading' }
  | { status: 'ok'; data: DayContent }
  | { status: 'missing' }
  | { status: 'error'; message: string }

export function useDayContent(contentId: string): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    setState({ status: 'loading' })
    let cancelled = false
    fetch(`/content/de/${contentId}.json`)
      .then(r => {
        if (r.status === 404) return null
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<DayContent>
      })
      .then(data => {
        if (cancelled) return
        setState(data ? { status: 'ok', data } : { status: 'missing' })
      })
      .catch(err => {
        if (!cancelled) setState({ status: 'error', message: String(err) })
      })
    return () => { cancelled = true }
  }, [contentId])

  return state
}
