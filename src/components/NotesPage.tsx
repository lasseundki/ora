import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import type { LiturgicalDay } from '../church-year'

interface Props {
  day: LiturgicalDay
}

const todayIso = () => new Date().toISOString().slice(0, 10)

export function NotesPage({ day }: Props) {
  const { user } = useAuth()
  const [text, setText]       = useState('')
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(true)

  const docRef = user
    ? doc(db, 'users', user.uid, 'notes', day.contentId)
    : null

  useEffect(() => {
    if (!docRef) return
    setLoading(true)
    setSaved(false)
    getDoc(docRef).then(snap => {
      setText(snap.exists() ? (snap.data().text ?? '') : '')
      setLoading(false)
    })
  }, [day.contentId, user?.uid])

  async function save() {
    if (!docRef || !user) return
    await setDoc(docRef, { text, updatedAt: serverTimestamp() })
    const actRef = doc(db, 'users', user.uid, 'activity', todayIso())
    await setDoc(actRef, { level: 3 }, { merge: true })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#f8f4ee]">
      <div className="h-1 w-full bg-stone-300" />
      <div className="max-w-xl mx-auto px-6 py-10">

        <p className={`text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-1`}>
          Notizen
        </p>
        <h1 className="font-serif text-2xl text-stone-800 mb-8">{day.name}</h1>

        {loading ? (
          <p className="font-serif text-stone-400 italic animate-pulse">Lade …</p>
        ) : (
          <>
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setSaved(false) }}
              placeholder="Gedanken, Gebete, Erkenntnisse …"
              rows={12}
              className="w-full bg-white/70 border border-stone-300 rounded px-4 py-3 font-serif text-[16px] leading-relaxed text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-stone-500 resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="font-serif text-xs text-stone-400 italic">
                {text.length > 0 ? `${text.length} Zeichen` : ''}
              </p>
              <button
                onClick={save}
                className="font-serif text-sm bg-stone-800 hover:bg-stone-700 text-[#f8f4ee] rounded px-5 py-2 transition-colors"
              >
                {saved ? '✓ Gespeichert' : 'Speichern'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
