import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { LiturgicalDay } from '../church-year'
import type { DayContent } from '../types/content'
import type { DayMode } from '../App'
import { getColors, SEASON_NAMES } from './colors'
import { AnnotatableText } from './AnnotatableText'

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
  return <h2 className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-3 ${accent}`}>{label}</h2>
}

function Ornament({ color }: { color: string }) {
  return <div className={`text-center my-6 ${color} select-none`} aria-hidden="true">✦</div>
}

function ProvenanceNote({ block }: { block: { author?: string; source?: string; year?: number } }) {
  const parts = [block.author, block.year ? String(block.year) : null].filter(Boolean)
  return parts.length || block.source ? (
    <p className="text-xs text-stone-400 mt-3 font-serif italic">
      {parts.join(', ')}{block.source ? ` — ${block.source}` : ''}
    </p>
  ) : null
}

// Vollständig kontrollierte Sektion: open/toggle kommen von außen
function Section({
  id, label, accent, dividerColor,
  open, isLast,
  onToggle, onAdvance, onEngaged,
  sectionRef,
  children,
}: {
  id: string
  label: string
  accent: string
  dividerColor: string
  open: boolean
  isLast: boolean
  onToggle: () => void
  onAdvance: () => void
  onEngaged: (id: string) => void
  sectionRef: (el: HTMLElement | null) => void
  children: React.ReactNode
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const firedRef   = useRef(false)

  useEffect(() => {
    firedRef.current = false
  }, [id])

  useEffect(() => {
    if (!open || firedRef.current || !contentRef.current) return
    const el = contentRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true
          onEngaged(id)
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [open, id, onEngaged])

  return (
    <>
      <Ornament color={dividerColor} />
      <section ref={sectionRef as React.RefCallback<HTMLElement>} id={`s-${id}`}>
        <button
          className="w-full flex items-center justify-between mb-3 group text-left"
          onClick={onToggle}
          aria-expanded={open}
        >
          <h2 className={`text-[10px] font-bold uppercase tracking-[0.25em] ${accent}`}>{label}</h2>
          <span className={`text-stone-300 group-hover:text-stone-500 text-xs transition-transform duration-200 select-none ${open ? '' : '-rotate-90'}`}>∨</span>
        </button>

        {open && (
          <div ref={contentRef}>
            {children}
            {/* Weiter-Button */}
            {!isLast && (
              <button
                onClick={onAdvance}
                className="mt-6 w-full flex items-center justify-end gap-1 font-serif text-[12px] text-stone-400 hover:text-stone-700 transition-colors"
              >
                Weiter <span className="text-base leading-none">→</span>
              </button>
            )}
          </div>
        )}
      </section>
    </>
  )
}

interface SectionMeta {
  id: string
  label: string
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
  const body = { fontSize, lineHeight: 1.85 }

  // Build ordered list of sections from available content + mode
  const sections: SectionMeta[] = useMemo(() => {
    const s: SectionMeta[] = []
    if (mode === 'morgen')             s.push({ id: 'morgengebet', label: 'Morgengebet' })
    if (content?.readings.gospel)     s.push({ id: 'gospel',      label: `Evangelium  ·  ${content.readings.gospel.ref}` })
    if (content?.readings.epistle)    s.push({ id: 'epistle',     label: `Epistel  ·  ${content.readings.epistle.ref}` })
    if (content?.readings.psalm)      s.push({ id: 'psalm',       label: `Psalm  ·  ${content.readings.psalm.ref}` })
    if (content?.devotion)            s.push({ id: 'devotion',    label: 'Andacht' })
    if (content?.hymn)                s.push({ id: 'hymn',        label: `Lied  ·  ${content.hymn.title}` })
    if (content?.collect)             s.push({ id: 'collect',     label: 'Kollekte' })
    if (content?.catechism_segment)   s.push({ id: 'catechism',   label: `Katechismus  ·  ${content.catechism_segment.part}` })
    if (mode === 'abend')             s.push({ id: 'abendgebet',  label: 'Abendgebet' })
    return s
  }, [mode, content])

  // Open state: set of open section IDs
  const firstId = sections[0]?.id ?? ''
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(firstId ? [firstId] : []))
  // Flow progress: index of furthest section reached
  const [flowProgress, setFlowProgress] = useState(0)
  // Engagement tracking
  const engagedIds = useRef<Set<string>>(new Set())
  const sectionEls = useRef<Record<string, HTMLElement | null>>({})

  // Reset when day or mode changes
  useEffect(() => {
    const first = sections[0]?.id
    setOpenIds(new Set(first ? [first] : []))
    setFlowProgress(0)
    engagedIds.current.clear()
  }, [day.contentId, mode])

  function toggle(id: string) {
    setOpenIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function advance(currentId: string) {
    const idx = sections.findIndex(s => s.id === currentId)
    if (idx < 0 || idx + 1 >= sections.length) return
    const nextId = sections[idx + 1].id
    setOpenIds(prev => new Set([...prev, nextId]))
    setFlowProgress(prev => Math.max(prev, idx + 1))
    setTimeout(() => {
      sectionEls.current[nextId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const handleEngaged = useCallback((id: string) => {
    if (engagedIds.current.has(id)) return
    engagedIds.current.add(id)
    onEngagement(engagedIds.current.size)
  }, [onEngagement])

  function renderContent(id: string) {
    if (!content) return null
    const dayId = day.contentId
    switch (id) {
      case 'morgengebet': return (
        <>
          <p className="font-serif text-stone-700 italic" style={body}>{MORGENGEBET}</p>
          <p className="text-xs text-stone-400 mt-3 font-serif italic">Luther, Kleiner Katechismus (1529)</p>
        </>
      )
      case 'gospel': return content.readings.gospel?.text
        ? <AnnotatableText text={content.readings.gospel.text} dayId={dayId} sectionId="gospel" className="font-serif text-stone-800" style={body} />
        : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>
      case 'epistle': return content.readings.epistle?.text
        ? <AnnotatableText text={content.readings.epistle.text} dayId={dayId} sectionId="epistle" className="font-serif text-stone-800" style={body} />
        : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>
      case 'psalm': return content.readings.psalm?.text
        ? <AnnotatableText text={content.readings.psalm.text} dayId={dayId} sectionId="psalm" className="font-serif text-stone-700 italic" style={body} />
        : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>
      case 'devotion': return (
        <>
          <p className="font-serif text-stone-800" style={body}>{content.devotion!.text}</p>
          <ProvenanceNote block={content.devotion!} />
        </>
      )
      case 'hymn': return (
        <>
          {(content.hymn!.stanzas ?? []).map((stanza, i) => (
            <p key={i} className="font-serif text-stone-700 whitespace-pre-line mb-4 last:mb-0" style={body}>{stanza}</p>
          ))}
          <ProvenanceNote block={content.hymn!} />
        </>
      )
      case 'collect': return (
        <p className="font-serif text-stone-700 italic" style={body}>{content.collect!.text}</p>
      )
      case 'catechism': return (
        <AnnotatableText text={content.catechism_segment!.text} dayId={dayId} sectionId="catechism" className="font-serif text-stone-800" style={body} />
      )
      case 'abendgebet': return (
        <>
          <p className="font-serif text-stone-700 italic" style={body}>{ABENDGEBET}</p>
          <p className="text-xs text-stone-400 mt-3 font-serif italic">Luther, Kleiner Katechismus (1529)</p>
        </>
      )
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f4ee]">
      <div className={`h-1 w-full ${c.strip}`} />

      <div className="max-w-xl mx-auto px-6 py-8">

        {/* Navigation */}
        <nav className="flex items-center justify-between mb-10">
          <button onClick={onPrev} className="text-stone-400 hover:text-stone-700 transition-colors px-1 py-1 text-lg" aria-label="Vorheriger Tag">←</button>
          <div className="flex flex-col items-center gap-1">
            <span className="font-serif text-[13px] text-stone-500 tracking-wide">{dateLabel}</span>
            <button
              onClick={onToggleMode}
              className="flex items-center gap-1.5 font-serif text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
              title="Modus wechseln: Morgen → Tag → Abend"
            >
              <span>{mode === 'morgen' ? '☀' : mode === 'tag' ? '○' : '☽'}</span>
              <span>{mode === 'morgen' ? 'Morgenandacht' : mode === 'tag' ? 'Tagesandacht' : 'Abendandacht'}</span>
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

        {loading && <p className="font-serif text-stone-400 text-base italic animate-pulse">Wird geladen …</p>}

        {!loading && !content && (
          <div className="border border-stone-200 rounded px-5 py-4">
            <p className="font-serif text-stone-500 text-base italic">Für diesen Tag ist noch kein Inhalt hinterlegt.</p>
          </div>
        )}

        {content && sections.length > 0 && (
          <article>

            {/* Eröffnung — immer sichtbar */}
            <section>
              <Rubric label="Eröffnung" accent={c.accent} />
              <p className="font-serif text-stone-700 italic" style={body}>
                Im Namen des Vaters und des Sohnes und des Heiligen Geistes. Amen.
              </p>
            </section>

            {/* Progress-Punkte */}
            {sections.length > 1 && (
              <div className="flex gap-1.5 justify-center mt-8 mb-2">
                {sections.map((s, i) => (
                  <div
                    key={s.id}
                    className={`rounded-full transition-all duration-300 ${
                      i <= flowProgress
                        ? 'w-2 h-2 bg-stone-500'
                        : 'w-1.5 h-1.5 bg-stone-200 mt-[1px]'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Kollabierbare Sektionen im Flow */}
            {sections.map((s, i) => (
              <Section
                key={s.id}
                id={s.id}
                label={s.label}
                accent={c.accent}
                dividerColor={c.divider}
                open={openIds.has(s.id)}
                isLast={i === sections.length - 1}
                onToggle={() => toggle(s.id)}
                onAdvance={() => advance(s.id)}
                onEngaged={handleEngaged}
                sectionRef={el => { sectionEls.current[s.id] = el }}
              >
                {renderContent(s.id)}
              </Section>
            ))}

            {/* Segen — immer sichtbar */}
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
