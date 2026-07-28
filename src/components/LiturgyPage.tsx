import { useState } from 'react'
import { useLiturgyParts } from '../hooks/useLiturgyParts'
import type { LiturgyPart } from '../types/liturgy'

function ProvenanceNote({ block }: { block: { author?: string; source?: string; year?: number; ref?: string } }) {
  const parts = [block.ref, block.author, block.year ? String(block.year) : null].filter(Boolean)
  if (!parts.length && !block.source) return null
  return (
    <p className="text-xs text-stone-400 mt-3 font-serif italic">
      {parts.join(', ')}{block.source ? ` — ${block.source}` : ''}
    </p>
  )
}

function LiturgyDetail({ part, onBack }: { part: LiturgyPart; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#f8f4ee]">
      <div className="h-1 w-full bg-stone-300" />
      <div className="max-w-xl mx-auto px-6 py-10">
        <button
          onClick={onBack}
          className="font-serif text-[11px] text-stone-400 hover:text-stone-600 transition-colors mb-6 flex items-center gap-1"
        >
          ← Liturgie
        </button>

        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-1">
          Teil {part.order} der Liturgie
        </p>
        <h1 className="font-serif text-xl text-stone-800 mb-6 leading-snug">{part.name}</h1>

        <p className="font-serif text-stone-700 leading-[1.9] mb-6">{part.explanation}</p>

        {part.text && (
          <div className="bg-white/70 border border-stone-100 rounded-2xl px-5 py-5 mt-2">
            <p className="font-serif text-stone-800 italic whitespace-pre-line leading-[1.9]">
              {part.text.content}
            </p>
            <ProvenanceNote block={part.text} />
          </div>
        )}
      </div>
    </div>
  )
}

export function LiturgyPage() {
  const state = useLiturgyParts()
  const [selected, setSelected] = useState<LiturgyPart | null>(null)

  if (selected) {
    return <LiturgyDetail part={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="min-h-screen bg-[#f8f4ee]">
      <div className="max-w-xl mx-auto px-6 py-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-1.5">
          Zum Nachlesen und Verstehen
        </p>
        <h1 className="font-serif text-xl text-stone-800 mb-2 leading-snug">Die Liturgie</h1>
        <p className="font-serif text-[13px] text-stone-400 mb-8 leading-relaxed">
          Was in einem lutherischen Gottesdienst geschieht und woher es kommt — unabhängig
          vom Kirchenbesuch, zum eigenen Verständnis.
        </p>

        {state.status === 'loading' && (
          <p className="font-serif text-stone-400 italic animate-pulse text-base">Wird geladen …</p>
        )}
        {state.status === 'error' && (
          <p className="font-serif text-stone-400 italic text-base">Liturgie-Übersicht konnte nicht geladen werden.</p>
        )}

        {state.status === 'ok' && (
          <div className="flex flex-col gap-3">
            {state.data.map(part => (
              <button
                key={part.id}
                onClick={() => setSelected(part)}
                className="text-left bg-white/70 border border-stone-100 rounded-2xl px-5 py-4 hover:bg-white transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-stone-800 text-[15px]">{part.name}</span>
                  <span className="text-[10px] text-stone-300 font-serif flex-shrink-0">{part.order}</span>
                </div>
                <p className="font-serif text-stone-400 text-[13px] mt-1 leading-snug">{part.summary}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
