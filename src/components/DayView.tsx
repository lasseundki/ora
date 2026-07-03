import { useEffect, useRef, useMemo } from 'react'
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

// Einzelne Inhalts-Karte
function Card({
  sectionId, label, accent, strip, observer, children,
}: {
  sectionId: string
  label: string
  accent: string
  strip: string
  observer: React.MutableRefObject<IntersectionObserver | null>
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !observer.current) return
    observer.current.observe(el)
    return () => observer.current?.unobserve(el)
  }, [observer])

  return (
    <div
      ref={ref}
      data-section-id={sectionId}
      className="bg-white/70 border border-stone-100 rounded-2xl overflow-hidden"
    >
      {/* Liturgischer Farbbalken oben */}
      <div className={`h-[3px] w-full ${strip}`} />
      <div className="px-5 pt-4 pb-5">
        <p className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-4 ${accent}`}>
          {label}
        </p>
        {children}
      </div>
    </div>
  )
}

function ProvenanceNote({ block }: { block: { author?: string; source?: string; year?: number } }) {
  const parts = [block.author, block.year ? String(block.year) : null].filter(Boolean)
  if (!parts.length && !block.source) return null
  return (
    <p className="text-xs text-stone-400 mt-3 font-serif italic">
      {parts.join(', ')}{block.source ? ` — ${block.source}` : ''}
    </p>
  )
}

interface Props {
  day: LiturgicalDay
  content: DayContent | null
  loading: boolean
  date: Date
  fontSize: number
  mode: DayMode
  onSetMode: (m: DayMode) => void
  onEngagement: (count: number) => void
}

const DOW    = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']
const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

const MODES: { id: DayMode; icon: string; label: string }[] = [
  { id: 'morgen', icon: '☀', label: 'Morgen' },
  { id: 'tag',    icon: '○', label: 'Tag'    },
  { id: 'abend',  icon: '☽', label: 'Abend'  },
]

export function DayView({ day, content, loading, date, fontSize, mode, onSetMode, onEngagement }: Props) {
  const c    = getColors(day.color)
  const body = { fontSize, lineHeight: 1.9 }
  const dateLabel = `${DOW[date.getDay()]}, ${date.getDate()}. ${MONTHS[date.getMonth()]} ${date.getFullYear()}`

  // Engagement-Tracking per IntersectionObserver auf jeder Karte
  const engagedIds = useRef<Set<string>>(new Set())
  const observer   = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const id = entry.target.getAttribute('data-section-id')
          if (id && !engagedIds.current.has(id)) {
            engagedIds.current.add(id)
            onEngagement(engagedIds.current.size)
          }
        }
      },
      { threshold: 0.3 },
    )
    return () => observer.current?.disconnect()
  }, [onEngagement])

  // Reset bei Tag- oder Modiwechsel
  useEffect(() => {
    engagedIds.current.clear()
  }, [day.contentId, mode])

  // Welche Sektionen sind vorhanden?
  const sections = useMemo(() => ({
    morgengebet: mode === 'morgen',
    gospel:   !!content?.readings.gospel,
    epistle:  !!content?.readings.epistle,
    psalm:    !!content?.readings.psalm,
    devotion: !!content?.devotion,
    hymn:     !!content?.hymn,
    collect:  !!content?.collect,
    catechism:!!content?.catechism_segment,
    abendgebet: mode === 'abend',
  }), [mode, content])

  const dayId = day.contentId

  return (
    <div className="min-h-screen bg-[#f8f4ee]">

      {/* Farbstreifen */}
      <div className={`h-1 w-full ${c.strip}`} />

      <div className="max-w-xl mx-auto px-5 pt-7 pb-28">

        {/* ── Kopfbereich ── */}
        <header className="mb-6">
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5 ${c.accent}`}>
            {SEASON_NAMES[day.season] ?? day.season}
          </p>
          <h1 className="font-serif text-[24px] text-stone-800 leading-tight">{day.name}</h1>
          {!day.isFeastDay && day.governingSunday && day.governingSunday !== day.name && (
            <p className="font-serif text-[13px] text-stone-400 mt-0.5 italic">{day.governingSunday}</p>
          )}
          <p className="font-serif text-[12px] text-stone-400 mt-1">{dateLabel}</p>
        </header>

        {/* ── Modus-Auswahl ── */}
        <div className="flex gap-2 mb-8">
          {MODES.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => onSetMode(id)}
              className={[
                'flex items-center gap-1.5 px-4 py-2 rounded-full font-serif text-[13px] transition-all',
                mode === id
                  ? 'bg-stone-800 text-[#f8f4ee] shadow-sm'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200',
              ].join(' ')}
            >
              <span className="text-[11px] leading-none">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ── Ladeindikator ── */}
        {loading && (
          <p className="font-serif text-stone-400 italic animate-pulse text-base">Wird geladen …</p>
        )}

        {/* ── Inhalts-Karten ── */}
        {!loading && (
          <div className="flex flex-col gap-4">

            {/* Eröffnung */}
            <Card sectionId="opening" label="Eröffnung" accent={c.accent} strip={c.strip} observer={observer}>
              <p className="font-serif text-stone-600 italic" style={body}>
                Im Namen des Vaters und des Sohnes und des Heiligen Geistes. Amen.
              </p>
            </Card>

            {/* Morgengebet */}
            {sections.morgengebet && (
              <Card sectionId="morgengebet" label="Morgengebet" accent={c.accent} strip={c.strip} observer={observer}>
                <p className="font-serif text-stone-700 italic" style={body}>{MORGENGEBET}</p>
                <p className="text-[11px] text-stone-400 mt-3 font-serif italic">Luther, Kleiner Katechismus (1529)</p>
              </Card>
            )}

            {/* Evangelium */}
            {sections.gospel && (
              <Card sectionId="gospel" label={`Evangelium · ${content!.readings.gospel.ref}`} accent={c.accent} strip={c.strip} observer={observer}>
                {(content!.readings.gospel.verses || content!.readings.gospel.text)
                  ? <AnnotatableText verses={content!.readings.gospel.verses} text={content!.readings.gospel.text} dayId={dayId} sectionId="gospel" className="font-serif text-stone-800" style={body} />
                  : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>
                }
              </Card>
            )}

            {/* Epistel */}
            {sections.epistle && (
              <Card sectionId="epistle" label={`Epistel · ${content!.readings.epistle!.ref}`} accent={c.accent} strip={c.strip} observer={observer}>
                {(content!.readings.epistle!.verses || content!.readings.epistle!.text)
                  ? <AnnotatableText verses={content!.readings.epistle!.verses} text={content!.readings.epistle!.text} dayId={dayId} sectionId="epistle" className="font-serif text-stone-800" style={body} />
                  : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>
                }
              </Card>
            )}

            {/* Psalm */}
            {sections.psalm && (
              <Card sectionId="psalm" label={`Psalm · ${content!.readings.psalm!.ref}`} accent={c.accent} strip={c.strip} observer={observer}>
                {(content!.readings.psalm!.verses || content!.readings.psalm!.text)
                  ? <AnnotatableText verses={content!.readings.psalm!.verses} text={content!.readings.psalm!.text} dayId={dayId} sectionId="psalm" className="font-serif text-stone-700 italic" style={body} />
                  : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>
                }
              </Card>
            )}

            {/* Andacht */}
            {sections.devotion && (
              <Card sectionId="devotion" label="Andacht" accent={c.accent} strip={c.strip} observer={observer}>
                <p className="font-serif text-stone-800" style={body}>{content!.devotion!.text}</p>
                <ProvenanceNote block={content!.devotion!} />
              </Card>
            )}

            {/* Lied */}
            {sections.hymn && (
              <Card sectionId="hymn" label={content!.hymn!.title} accent={c.accent} strip={c.strip} observer={observer}>
                {(content!.hymn!.stanzas ?? []).map((stanza, i) => (
                  <p key={i} className="font-serif text-stone-700 whitespace-pre-line mb-5 last:mb-0" style={body}>{stanza}</p>
                ))}
                <ProvenanceNote block={content!.hymn!} />
              </Card>
            )}

            {/* Kollekte */}
            {sections.collect && (
              <Card sectionId="collect" label="Kollekte" accent={c.accent} strip={c.strip} observer={observer}>
                <p className="font-serif text-stone-700 italic" style={body}>{content!.collect!.text}</p>
              </Card>
            )}

            {/* Katechismus */}
            {sections.catechism && (
              <Card sectionId="catechism" label={`Katechismus · ${content!.catechism_segment!.part}`} accent={c.accent} strip={c.strip} observer={observer}>
                <AnnotatableText text={content!.catechism_segment!.text} dayId={dayId} sectionId="catechism" className="font-serif text-stone-800" style={body} />
              </Card>
            )}

            {/* Abendgebet */}
            {sections.abendgebet && (
              <Card sectionId="abendgebet" label="Abendgebet" accent={c.accent} strip={c.strip} observer={observer}>
                <p className="font-serif text-stone-700 italic" style={body}>{ABENDGEBET}</p>
                <p className="text-[11px] text-stone-400 mt-3 font-serif italic">Luther, Kleiner Katechismus (1529)</p>
              </Card>
            )}

            {/* Segen */}
            <Card sectionId="segen" label="Segen" accent={c.accent} strip={c.strip} observer={observer}>
              <p className="font-serif text-stone-600 italic" style={body}>
                Der Herr segne dich und behüte dich; der Herr lasse sein Angesicht leuchten über dir und sei dir gnädig; der Herr erhebe sein Angesicht über dich und gebe dir Frieden. Amen.
              </p>
              <p className="text-[11px] text-stone-400 mt-3 font-serif italic">4. Mose 6,24–26</p>
            </Card>

          </div>
        )}

        {/* ── Fußzeile ── */}
        <div className="mt-10 pt-5 border-t border-stone-100 flex items-center justify-between">
          <p className="font-serif text-[11px] text-stone-300 italic">
            Lutherbibel 1912 (gemeinfrei)
          </p>
        </div>

      </div>
    </div>
  )
}
