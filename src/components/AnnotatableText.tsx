import { useState, useRef, useEffect } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

// Firestore: users/{uid}/inline-notes/{dayId}_{sectionId}_{hash}
// { dayId, sectionId, selectedText, note, createdAt }

interface Annotation {
  id: string         // hash of selectedText
  selectedText: string
  note: string
}

interface PopoverState {
  x: number
  y: number
  selectedText: string
}

function hashText(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h).toString(36)
}

function highlight(text: string, annotations: Annotation[]): React.ReactNode {
  if (!annotations.length) return text
  // Sort by position of first occurrence
  const sorted = [...annotations].sort(
    (a, b) => text.indexOf(a.selectedText) - text.indexOf(b.selectedText)
  )
  const parts: React.ReactNode[] = []
  let cursor = 0
  for (const ann of sorted) {
    const idx = text.indexOf(ann.selectedText, cursor)
    if (idx < 0) continue
    if (idx > cursor) parts.push(text.slice(cursor, idx))
    parts.push(
      <mark
        key={ann.id}
        className="bg-amber-100 text-stone-800 rounded-sm cursor-pointer"
        title={ann.note}
      >
        {ann.selectedText}
      </mark>
    )
    cursor = idx + ann.selectedText.length
  }
  if (cursor < text.length) parts.push(text.slice(cursor))
  return parts
}

interface Props {
  text: string
  dayId: string
  sectionId: string
  className?: string
  style?: React.CSSProperties
}

export function AnnotatableText({ text, dayId, sectionId, className, style }: Props) {
  const { user } = useAuth()
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [popover, setPopover]         = useState<PopoverState | null>(null)
  const [noteInput, setNoteInput]     = useState('')
  const [saving, setSaving]           = useState(false)
  const containerRef = useRef<HTMLParagraphElement>(null)

  // Load existing annotations
  useEffect(() => {
    if (!user) return
    const docId = `${dayId}_${sectionId}`
    getDoc(doc(db, 'users', user.uid, 'inline-notes', docId)).then(snap => {
      if (snap.exists()) setAnnotations(snap.data().annotations ?? [])
    })
  }, [user, dayId, sectionId])

  function onMouseUp() {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) { setPopover(null); return }
    const selected = sel.toString().trim()
    if (selected.length < 3) { setPopover(null); return }
    // Only react to selections inside this element
    const range = sel.getRangeAt(0)
    if (!containerRef.current?.contains(range.commonAncestorContainer)) return
    const rect = range.getBoundingClientRect()
    const containerRect = containerRef.current!.getBoundingClientRect()
    setPopover({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top  - containerRect.top  - 8,
      selectedText: selected,
    })
    setNoteInput('')
  }

  function dismiss() {
    setPopover(null)
    window.getSelection()?.removeAllRanges()
  }

  async function saveNote() {
    if (!user || !popover || !noteInput.trim()) return
    setSaving(true)
    const id = hashText(popover.selectedText)
    const newAnn: Annotation = { id, selectedText: popover.selectedText, note: noteInput.trim() }
    const merged = [...annotations.filter(a => a.id !== id), newAnn]
    const docId = `${dayId}_${sectionId}`
    await setDoc(
      doc(db, 'users', user.uid, 'inline-notes', docId),
      { dayId, sectionId, annotations: merged, updatedAt: serverTimestamp() }
    )
    setAnnotations(merged)
    setSaving(false)
    dismiss()
  }

  return (
    <div className="relative select-text">
      <p
        ref={containerRef}
        className={className}
        style={style}
        onMouseUp={onMouseUp}
        onTouchEnd={onMouseUp}
      >
        {highlight(text, annotations)}
      </p>

      {popover && (
        <div
          className="absolute z-10 bg-white border border-stone-200 rounded-lg shadow-lg p-3 w-64"
          style={{
            left: Math.max(0, popover.x - 128),
            top: popover.y - 120,
          }}
        >
          <p className="font-serif text-[11px] text-stone-400 mb-2 italic truncate">
            „{popover.selectedText}"
          </p>
          <textarea
            autoFocus
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            placeholder="Gedanke zur Auswahl …"
            rows={2}
            className="w-full text-sm font-serif text-stone-800 bg-stone-50 border border-stone-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:border-stone-400 placeholder:text-stone-300"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={saveNote}
              disabled={!noteInput.trim() || saving}
              className="flex-1 text-xs font-serif bg-stone-800 text-[#f8f4ee] rounded py-1.5 disabled:opacity-40 hover:bg-stone-700 transition-colors"
            >
              {saving ? '…' : 'Speichern'}
            </button>
            <button
              onClick={dismiss}
              className="text-xs font-serif text-stone-400 hover:text-stone-700 px-2"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
