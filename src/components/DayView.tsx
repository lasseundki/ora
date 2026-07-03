import { useState, useEffect, useRef, useMemo } from 'react'
import type { LiturgicalDay } from '../church-year'
import type { DayContent } from '../types/content'
import type { DayMode } from '../App'
import { getColors, SEASON_NAMES } from './colors'
import { AnnotatableText } from './AnnotatableText'

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

function ProvenanceNote({ block }: { block: { author?: string; source?: string; year?: number } }) {
  const parts = [block.author, block.year ? String(block.year) : null].filter(Boolean)
  return parts.length || block.source ? (
    <p className="text-xs text-stone-400 mt-4 font-serif italic">
      {parts.join(', ')}{block.source ? ` — ${block.source}` : ''}
    </p>
  ) : null
}

interface StepMeta {
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
  onToggleMode: () => void
  onEngagement: (count: number) => void
}

const DOW    = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']
const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
const MODE_ICON: Record<DayMode, string>  = { morgen: '☀', tag: '○', abend: '☽' }
const MODE_LABEL: Record<DayMode, string> = { morgen: 'Morgen', tag: 'Tag', abend: 'Abend' }

export function DayView({ day, content, loading, date, fontSize, mode, onPrev, onToggleMode, onEngagement }: Props) {
  const c    = getColors(day.color)
  const body = { fontSize, lineHeight: 1.9 }
  const dateLabel = `${DOW[date.getDay()]}, ${date.getDate()}. ${MONTHS[date.getMonth()]} ${date.getFullYear()}`

  const [step, setStep] = useState(0)
  const engagedIds = useRef<Set<string>>(new Set())

  const steps: StepMeta[] = useMemo(() => {
    const s: StepMeta[] = []
    s.push({ id: 'opening', label: 'Eröffnung' })
    if (mode === 'morgen')              s.push({ id: 'morgengebet', label: 'Morgengebet' })
    if (content?.readings.gospel)      s.push({ id: 'gospel',      label: `Evangelium · ${content.readings.gospel.ref}` })
    if (content?.readings.epistle)     s.push({ id: 'epistle',     label: `Epistel · ${content.readings.epistle.ref}` })
    if (content?.readings.psalm)       s.push({ id: 'psalm',       label: `Psalm · ${content.readings.psalm.ref}` })
    if (content?.devotion)             s.push({ id: 'devotion',    label: 'Andacht' })
    if (content?.hymn)                 s.push({ id: 'hymn',        label: content.hymn.title })
    if (content?.collect)              s.push({ id: 'collect',     label: 'Kollekte' })
    if (content?.catechism_segment)    s.push({ id: 'catechism',   label: `Katechismus · ${content.catechism_segment.part}` })
    if (mode === 'abend')              s.push({ id: 'abendgebet',  label: 'Abendgebet' })
    s.push({ id: 'segen', label: 'Segen' })
    return s
  }, [mode, content])

  // Reset on day/mode change
  useEffect(() => {
    setStep(0)
    engagedIds.current.clear()
  }, [day.contentId, mode])

  // Engagement: mark each step as engaged when first visited
  useEffect(() => {
    const id = steps[step]?.id
    if (!id || engagedIds.current.has(id)) return
    engagedIds.current.add(id)
    onEngagement(engagedIds.current.size)
  }, [step, steps, onEngagement])

  function goNext() {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  function goPrev() {
    if (step > 0) {
      setStep(s => s - 1)
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      onPrev()
    }
  }

  function renderContent(id: string): React.ReactNode {
    const dayId = day.contentId
    switch (id) {
      case 'opening':
        return (
          <p className="font-serif text-stone-700 italic" style={body}>
            Im Namen des Vaters und des Sohnes und des Heiligen Geistes. Amen.
          </p>
        )
      case 'morgengebet':
        return (
          <>
            <p className="font-serif text-stone-700 italic" style={body}>{MORGENGEBET}</p>
            <p className="text-xs text-stone-400 mt-4 font-serif italic">Luther, Kleiner Katechismus (1529)</p>
          </>
        )
      case 'gospel': return (content?.readings.gospel?.verses || content?.readings.gospel?.text)
        ? <AnnotatableText verses={content!.readings.gospel.verses} text={content!.readings.gospel.text} dayId={dayId} sectionId="gospel" className="font-serif text-stone-800" style={body} />
        : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>
      case 'epistle': return (content?.readings.epistle?.verses || content?.readings.epistle?.text)
        ? <AnnotatableText verses={content!.readings.epistle.verses} text={content!.readings.epistle.text} dayId={dayId} sectionId="epistle" className="font-serif text-stone-800" style={body} />
        : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>
      case 'psalm': return (content?.readings.psalm?.verses || content?.readings.psalm?.text)
        ? <AnnotatableText verses={content!.readings.psalm.verses} text={content!.readings.psalm.text} dayId={dayId} sectionId="psalm" className="font-serif text-stone-700 italic" style={body} />
        : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>
      case 'devotion':
        return (
          <>
            <p className="font-serif text-stone-800" style={body}>{content!.devotion!.text}</p>
            <ProvenanceNote block={content!.devotion!} />
          </>
        )
      case 'hymn':
        return (
          <>
            {(content!.hymn!.stanzas ?? []).map((stanza, i) => (
              <p key={i} className="font-serif text-stone-700 whitespace-pre-line mb-6 last:mb-0" style={body}>{stanza}</p>
            ))}
            <ProvenanceNote block={content!.hymn!} />
          </>
        )
      case 'collect':
        return <p className="font-serif text-stone-700 italic" style={body}>{content!.collect!.text}</p>
      case 'catechism':
        return <AnnotatableText text={content!.catechism_segment!.text} dayId={dayId} sectionId="catechism" className="font-serif text-stone-800" style={body} />
      case 'abendgebet':
        return (
          <>
            <p className="font-serif text-stone-700 italic" style={body}>{ABENDGEBET}</p>
            <p className="text-xs text-stone-400 mt-4 font-serif italic">Luther, Kleiner Katechismus (1529)</p>
          </>
        )
      case 'segen':
        return (
          <>
            <p className="font-serif text-stone-700 italic" style={body}>
              Der Herr segne dich und behüte dich; der Herr lasse sein Angesicht leuchten über dir und sei dir gnädig; der Herr erhebe sein Angesicht über dich und gebe dir Frieden. Amen.
            </p>
            <p className="text-xs text-stone-400 mt-4 font-serif italic">4. Mose 6,24–26</p>
          </>
        )
      default: return null
    }
  }

  const current = steps[step]
  const isFirst = step === 0
  const isLast  = step === steps.length - 1

  return (
    <div className="min-h-screen bg-[#f8f4ee]">

      {/* Liturgischer Farbstreifen */}
      <div className={`h-1 w-full ${c.strip}`} />

      {/* Inhalt */}
      <div className="max-w-xl mx-auto px-6 pt-7 pb-36">

        {/* Kopfzeile: Kirchentag + Modus-Toggle */}
        <header className="flex items-start justify-between mb-10">
          <div className="flex-1 min-w-0 pr-4">
            <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5 ${c.accent}`}>
              {SEASON_NAMES[day.season] ?? day.season}
            </p>
            <h1 className="font-serif text-[22px] text-stone-800 leading-snug">{day.name}</h1>
            <p className="font-serif text-[12px] text-stone-400 mt-1">{dateLabel}</p>
          </div>
          <button
            onClick={onToggleMode}
            className="flex items-center gap-1 font-serif text-[11px] text-stone-400 hover:text-stone-600 transition-colors mt-0.5 flex-shrink-0"
            title="Modus wechseln: Morgen → Tag → Abend"
          >
            <span>{MODE_ICON[mode]}</span>
            <span>{MODE_LABEL[mode]}</span>
          </button>
        </header>

        {/* Ladeindikator */}
        {loading && (
          <p className="font-serif text-stone-400 italic animate-pulse text-base">Wird geladen …</p>
        )}

        {/* Aktueller Schritt */}
        {!loading && current && (
          <>
            {/* Abschnittsname */}
            <p className={`text-[10px] font-bold uppercase tracking-[0.28em] mb-5 ${c.accent}`}>
              {current.label}
            </p>

            {/* Inhalt */}
            {renderContent(current.id)}

            {/* Provenienz-Fußzeile beim Segen */}
            {isLast && (
              <p className="font-serif text-[11px] text-stone-300 mt-14 italic">
                Bibeltext: Lutherbibel 1912 (gemeinfrei)
              </p>
            )}
          </>
        )}

      </div>

      {/* Navigationsleiste — fixiert über dem Tab-Menü */}
      <nav className="fixed bottom-12 inset-x-0 bg-[#f8f4ee]/95 backdrop-blur-sm border-t border-stone-100">
        <div className="max-w-xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Zurück */}
          <button
            onClick={goPrev}
            className={`font-serif text-[15px] text-stone-400 hover:text-stone-700 transition-colors w-10 text-left ${isFirst ? 'opacity-0 pointer-events-none' : ''}`}
            aria-label="Zurück"
          >
            ←
          </button>

          {/* Fortschritt-Punkte */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`rounded-full transition-all duration-200 ${
                  i === step
                    ? 'w-4 h-[5px] bg-stone-500'
                    : i < step
                    ? 'w-[5px] h-[5px] bg-stone-400'
                    : 'w-[5px] h-[5px] bg-stone-200'
                }`}
              />
            ))}
          </div>

          {/* Weiter / Abschluss */}
          <div className="w-20 text-right">
            {isLast ? (
              <span className="font-serif text-[13px] text-stone-300 italic">Amen ✓</span>
            ) : (
              <button
                onClick={goNext}
                className="font-serif text-[15px] text-stone-600 hover:text-stone-900 transition-colors"
                aria-label="Weiter"
              >
                →
              </button>
            )}
          </div>

        </div>
      </nav>

    </div>
  )
}
