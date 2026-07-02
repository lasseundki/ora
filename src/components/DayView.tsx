import { useState, useEffect, useRef, useCallback } from 'react'
import type { LiturgicalDay } from '../church-year'
import type { DayContent } from '../types/content'
import type { DayMode } from '../App'
import { getColors, SEASON_NAMES } from './colors'

// Luther, Kleiner Katechismus (1529) — gemeinfrei
const MORGENGEBET =
  'Ich danke dir, mein himmlischer Vater, durch Jesum Christum, deinen lieben Sohn, ' +
  'daß du mich diese Nacht vor allem Schaden und Gefahr behütet hast, und bitte dich, ' +
  'du wollest mich diesen Tag auch behüten vor Sünden und allem Übel, daß dir all mein ' +
  'Tun und Leben gefalle. Denn ich befehle mich, meinen Leib und Seele und alles, in ' +
  'deine Hände. Dein heiliger Engel sei mit mir, daß der böse Feind keine Macht an mir finde. Amen.'

const ABENDGEBET =
  'Ich danke dir, mein himmlischer Vater, durch Jesum Christum, deinen lieben Sohn, ' +
  'daß du mich diesen Tag gnädiglich behütet hast, und bitte dich, du wollest mir vergeben ' +
  'alle meine Sünde, wo ich Unrecht getan habe, und mich diese Nacht gnädiglich behüten. ' +
  'Denn ich befehle mich, meinen Leib und Seele und alles, in deine Hände. Dein heiliger ' +
  'Engel sei mit mir, daß der böse Feind keine Macht an mir finde. Amen.'

function Rubric({ label, accent }: { label: string; accent: string }) {
  return (
    <h2 className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-3 ${accent}`}>
      {label}
    </h2>
  )
}

function Ornament({ color }: { color: string }) {
  return (
    <div className={`text-center my-6 ${color} select-none`} aria-hidden="true">✦</div>
  )
}

function ProvenanceNote({ block }: { block: { author?: string; source?: string; year?: number } }) {
  const parts = [block.author, block.year ? String(block.year) : null].filter(Boolean)
  return parts.length || block.source ? (
    <p className="text-xs text-stone-400 mt-3 font-serif italic">
      {parts.join(', ')}{block.source ? ` — ${block.source}` : ''}
    </p>
  ) : null
}

function CollapsibleSection({
  label, accent, dividerColor, defaultOpen = false, onEngaged, children,
}: {
  label: string
  accent: string
  dividerColor: string
  defaultOpen?: boolean
  onEngaged?: () => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const firedRef   = useRef(false)

  useEffect(() => {
    if (!open || firedRef.current || !onEngaged || !contentRef.current) return
    const el = contentRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true
          onEngaged()
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [open, onEngaged])

  return (
    <>
      <Ornament color={dividerColor} />
      <section>
        <button
          className="w-full flex items-center justify-between mb-3 group text-left"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
        >
          <h2 className={`text-[10px] font-bold uppercase tracking-[0.25em] ${accent}`}>{label}</h2>
          <span className={`text-stone-300 group-hover:text-stone-500 text-xs transition-transform duration-200 select-none ${open ? '' : '-rotate-90'}`}>
            ∨
          </span>
        </button>
        {open && <div ref={contentRef}>{children}</div>}
      </section>
    </>
  )
}

interface Props {
  day: LiturgicalDay
  content: DayContent | null
  loading: boolean
  date: Date
  fontSize: number
  mode: DayMode
  onPrev: () => void
  onNext: () => void
  onToggleMode: () => void
  onEngagement: (count: number) => void
}

const DOW    = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']
const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

export function DayView({ day, content, loading, date, fontSize, mode, onPrev, onNext, onToggleMode, onEngagement }: Props) {
  const c = getColors(day.color)
  const dateLabel = `${DOW[date.getDay()]}, ${date.getDate()}. ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
  const [engagedCount, setEngagedCount] = useState(0)

  const handleEngaged = useCallback(() => {
    setEngagedCount(n => {
      const next = n + 1
      onEngagement(next)
      return next
    })
  }, [onEngagement])

  useEffect(() => { setEngagedCount(0) }, [day.contentId])

  const body = { fontSize, lineHeight: 1.85 }

  return (
    <div className="min-h-screen bg-[#f8f4ee]">
      <div className={`h-1 w-full ${c.strip}`} />

      <div className="max-w-xl mx-auto px-6 py-8">

        {/* Navigation */}
        <nav className="flex items-center justify-between mb-10">
          <button onClick={onPrev} className="text-stone-400 hover:text-stone-700 transition-colors px-1 py-1 text-lg" aria-label="Vorheriger Tag">←</button>

          <div className="flex flex-col items-center gap-1">
            <span className="font-serif text-[13px] text-stone-500 tracking-wide">{dateLabel}</span>
            {/* Morgen/Abend-Toggle */}
            <button
              onClick={onToggleMode}
              className="flex items-center gap-1.5 font-serif text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
              title="Morgen- oder Abendandacht wechseln"
            >
              <span>{mode === 'morgen' ? '☀' : '☽'}</span>
              <span>{mode === 'morgen' ? 'Morgenandacht' : 'Abendandacht'}</span>
            </button>
          </div>

          <button onClick={onNext} className="text-stone-400 hover:text-stone-700 transition-colors px-1 py-1 text-lg" aria-label="Nächster Tag">→</button>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-3 ${c.accent}`}>
            {SEASON_NAMES[day.season] ?? day.season}
          </p>
          <h1 className="font-serif text-3xl leading-snug text-stone-800">{day.name}</h1>
          {!day.isFeastDay && day.governingSunday && (
            <p className="font-serif text-sm text-stone-400 mt-1 italic">{day.governingSunday}</p>
          )}
        </header>

        {loading && (
          <p className="font-serif text-stone-400 text-base italic animate-pulse">Wird geladen …</p>
        )}

        {!loading && !content && (
          <div className="border border-stone-200 rounded px-5 py-4">
            <p className="font-serif text-stone-500 text-base italic">Für diesen Tag ist noch kein Inhalt hinterlegt.</p>
          </div>
        )}

        {content && (
          <article>

            {/* Eröffnung */}
            <section>
              <Rubric label="Eröffnung" accent={c.accent} />
              <p className="font-serif text-stone-700 italic" style={body}>
                Im Namen des Vaters und des Sohnes und des Heiligen Geistes. Amen.
              </p>
            </section>

            {/* Morgengebet — nur im Morgenmodus, vor den Lesungen */}
            {mode === 'morgen' && (
              <CollapsibleSection label="Morgengebet" accent={c.accent} dividerColor={c.divider} defaultOpen onEngaged={handleEngaged}>
                <p className="font-serif text-stone-700 italic" style={body}>{MORGENGEBET}</p>
                <p className="text-xs text-stone-400 mt-3 font-serif italic">Luther, Kleiner Katechismus (1529)</p>
              </CollapsibleSection>
            )}

            {/* Lesungen */}
            {content.readings.gospel && (
              <CollapsibleSection label={`Evangelium  ·  ${content.readings.gospel.ref}`} accent={c.accent} dividerColor={c.divider} defaultOpen onEngaged={handleEngaged}>
                {content.readings.gospel.text
                  ? <p className="font-serif text-stone-800" style={body}>{content.readings.gospel.text}</p>
                  : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>}
              </CollapsibleSection>
            )}

            {content.readings.epistle && (
              <CollapsibleSection label={`Epistel  ·  ${content.readings.epistle.ref}`} accent={c.accent} dividerColor={c.divider} onEngaged={handleEngaged}>
                {content.readings.epistle.text
                  ? <p className="font-serif text-stone-800" style={body}>{content.readings.epistle.text}</p>
                  : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>}
              </CollapsibleSection>
            )}

            {content.readings.psalm && (
              <CollapsibleSection label={`Psalm  ·  ${content.readings.psalm.ref}`} accent={c.accent} dividerColor={c.divider} onEngaged={handleEngaged}>
                {content.readings.psalm.text
                  ? <p className="font-serif text-stone-700 italic" style={body}>{content.readings.psalm.text}</p>
                  : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>}
              </CollapsibleSection>
            )}

            {content.devotion && (
              <CollapsibleSection label="Andacht" accent={c.accent} dividerColor={c.divider} onEngaged={handleEngaged}>
                <p className="font-serif text-stone-800" style={body}>{content.devotion.text}</p>
                <ProvenanceNote block={content.devotion} />
              </CollapsibleSection>
            )}

            {content.hymn && (
              <CollapsibleSection label={`Lied  ·  ${content.hymn.title}`} accent={c.accent} dividerColor={c.divider} onEngaged={handleEngaged}>
                {(content.hymn.stanzas ?? []).map((stanza, i) => (
                  <p key={i} className="font-serif text-stone-700 whitespace-pre-line mb-4 last:mb-0" style={body}>{stanza}</p>
                ))}
                <ProvenanceNote block={content.hymn} />
              </CollapsibleSection>
            )}

            {content.collect && (
              <CollapsibleSection label="Kollekte" accent={c.accent} dividerColor={c.divider} onEngaged={handleEngaged}>
                <p className="font-serif text-stone-700 italic" style={body}>{content.collect.text}</p>
              </CollapsibleSection>
            )}

            {content.catechism_segment && (
              <CollapsibleSection label={`Katechismus  ·  ${content.catechism_segment.part}`} accent={c.accent} dividerColor={c.divider} onEngaged={handleEngaged}>
                <p className="font-serif text-stone-800" style={body}>{content.catechism_segment.text}</p>
              </CollapsibleSection>
            )}

            {/* Abendgebet — nur im Abendmodus, vor dem Segen */}
            {mode === 'abend' && (
              <CollapsibleSection label="Abendgebet" accent={c.accent} dividerColor={c.divider} defaultOpen onEngaged={handleEngaged}>
                <p className="font-serif text-stone-700 italic" style={body}>{ABENDGEBET}</p>
                <p className="text-xs text-stone-400 mt-3 font-serif italic">Luther, Kleiner Katechismus (1529)</p>
              </CollapsibleSection>
            )}

            {/* Segen — immer */}
            <Ornament color={c.divider} />
            <section>
              <Rubric label="Segen" accent={c.accent} />
              <p className="font-serif text-stone-700 italic" style={body}>
                Der Herr segne dich und behüte dich; der Herr lasse sein Angesicht leuchten über dir und sei dir gnädig; der Herr erhebe sein Angesicht über dich und gebe dir Frieden. Amen.
              </p>
            </section>

            <p className="font-serif text-xs text-stone-300 mt-10 mb-4 italic">
              Bibeltext: Lutherbibel 1912 (gemeinfrei)
            </p>

          </article>
        )}
      </div>
    </div>
  )
}
