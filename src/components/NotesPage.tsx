import { useState, useEffect } from 'react'
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import type { LiturgicalDay } from '../church-year'

interface NoteEntry {
  contentId: string
  dayName: string
  text: string
  updatedAt: Date | null
}

const todayIso = () => new Date().toISOString().slice(0, 10)

// Editor für eine einzelne Notiz
function NoteEditor({
  contentId, dayName, onBack,
}: {
  contentId: string
  dayName: string
  onBack: () => void
}) {
  const { user } = useAuth()
  const [text, setText]       = useState('')
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(true)

  const docRef = user ? doc(db, 'users', user.uid, 'notes', contentId) : null

  useEffect(() => {
    if (!docRef) return
    getDoc(docRef).then(snap => {
      setText(snap.exists() ? (snap.data().text ?? '') : '')
      setLoading(false)
    })
  }, [contentId, user?.uid])

  async function save() {
    if (!docRef || !user) return
    await setDoc(docRef, { text, dayName, updatedAt: serverTimestamp() }, { merge: true })
    const actRef = doc(db, 'users', user.uid, 'activity', todayIso())
    await setDoc(actRef, { level: 3 }, { merge: true })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#f8f4ee]">
      <div className="h-1 w-full bg-stone-300" />
      <div className="max-w-xl mx-auto px-6 py-10">
        <button
          onClick={onBack}
          className="font-serif text-[11px] text-stone-400 hover:text-stone-600 transition-colors mb-6 flex items-center gap-1"
        >
          ← Alle Notizen
        </button>

        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-1">Notiz</p>
        <h1 className="font-serif text-xl text-stone-800 mb-8 leading-snug">{dayName}</h1>

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

// Übersicht aller Notizen
interface Props {
  day: LiturgicalDay
}

export function NotesPage({ day }: Props) {
  const { user } = useAuth()
  const [allNotes, setAllNotes]   = useState<NoteEntry[]>([])
  const [loadingAll, setLoadingAll] = useState(true)
  const [selected, setSelected]   = useState<{ contentId: string; dayName: string } | null>(null)

  useEffect(() => {
    if (!user) return
    setLoadingAll(true)
    getDocs(collection(db, 'users', user.uid, 'notes')).then(snap => {
      const entries: NoteEntry[] = snap.docs
        .map(d => ({
          contentId: d.id,
          dayName:   d.data().dayName ?? d.id,
          text:      d.data().text ?? '',
          updatedAt: d.data().updatedAt?.toDate?.() ?? null,
        }))
        .filter(e => e.text.trim().length > 0)
        .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0))
      setAllNotes(entries)
      setLoadingAll(false)
    })
  }, [user?.uid, selected]) // Reload nach dem Speichern

  if (selected) {
    return (
      <NoteEditor
        contentId={selected.contentId}
        dayName={selected.dayName}
        onBack={() => setSelected(null)}
      />
    )
  }

  const todayNote = allNotes.find(n => n.contentId === day.contentId)
  const otherNotes = allNotes.filter(n => n.contentId !== day.contentId)

  return (
    <div className="min-h-screen bg-[#f8f4ee]">
      <div className="h-1 w-full bg-stone-300" />
      <div className="max-w-xl mx-auto px-6 py-10">

        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-1">Notizen</p>
        <h1 className="font-serif text-2xl text-stone-800 mb-8">Meine Notizen</h1>

        {/* Heutiger Tag — immer oben */}
        <section className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Heute</p>
          <button
            onClick={() => setSelected({ contentId: day.contentId, dayName: day.name })}
            className="w-full text-left bg-white/70 border border-stone-200 rounded-lg px-5 py-4 hover:bg-white transition-colors"
          >
            <p className="font-serif text-[15px] text-stone-700 leading-snug">{day.name}</p>
            {todayNote ? (
              <p className="font-serif text-xs text-stone-400 mt-1 italic line-clamp-2">
                {todayNote.text.slice(0, 100)}
              </p>
            ) : (
              <p className="font-serif text-xs text-stone-300 mt-1 italic">Noch keine Notiz</p>
            )}
          </button>
        </section>

        {/* Frühere Notizen */}
        {loadingAll ? (
          <p className="font-serif text-stone-400 italic animate-pulse text-sm">Lade …</p>
        ) : otherNotes.length > 0 ? (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Frühere Tage</p>
            <div className="flex flex-col gap-2">
              {otherNotes.map(n => (
                <button
                  key={n.contentId}
                  onClick={() => setSelected({ contentId: n.contentId, dayName: n.dayName })}
                  className="w-full text-left bg-white/50 border border-stone-100 rounded-lg px-5 py-4 hover:bg-white/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-serif text-[14px] text-stone-600 leading-snug">{n.dayName}</p>
                    {n.updatedAt && (
                      <p className="font-serif text-[10px] text-stone-300 flex-shrink-0 mt-0.5">
                        {n.updatedAt.getDate()}.{n.updatedAt.getMonth() + 1}.
                      </p>
                    )}
                  </div>
                  <p className="font-serif text-xs text-stone-400 mt-1 italic line-clamp-2">
                    {n.text.slice(0, 100)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ) : (
          !loadingAll && otherNotes.length === 0 && !todayNote && (
            <p className="font-serif text-stone-400 text-sm italic">
              Noch keine Notizen gespeichert.
            </p>
          )
        )}
      </div>
    </div>
  )
}
