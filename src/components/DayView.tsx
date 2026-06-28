import type { LiturgicalDay } from '../church-year'
import type { DayContent } from '../types/content'
import { getColors, SEASON_NAMES } from './colors'

function Rubric({ label, accent }: { label: string; accent: string }) {
  return (
    <h2 className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-3 ${accent}`}>
      {label}
    </h2>
  )
}

function Ornament({ color }: { color: string }) {
  return (
    <div className={`text-center my-6 ${color} select-none`} aria-hidden="true">
      ✦
    </div>
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

interface Props {
  day: LiturgicalDay
  content: DayContent | null
  loading: boolean
  date: Date
  onPrev: () => void
  onNext: () => void
  onLogout?: () => void
}

const DOW = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']
const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

export function DayView({ day, content, loading, date, onPrev, onNext, onLogout }: Props) {
  const c = getColors(day.color)
  const dateLabel = `${DOW[date.getDay()]}, ${date.getDate()}. ${MONTHS[date.getMonth()]} ${date.getFullYear()}`

  return (
    <div className="min-h-screen bg-[#f8f4ee]">

      {/* Liturgischer Farbstreifen */}
      <div className={`h-1 w-full ${c.strip}`} />

      <div className="max-w-xl mx-auto px-6 py-8">

        {/* Navigation */}
        <nav className="flex items-center justify-between mb-10">
          <button
            onClick={onPrev}
            className="text-stone-400 hover:text-stone-700 transition-colors px-1 py-1 text-lg"
            aria-label="Vorheriger Tag"
          >
            ←
          </button>
          <span className="font-serif text-[13px] text-stone-500 tracking-wide">{dateLabel}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onNext}
              className="text-stone-400 hover:text-stone-700 transition-colors px-1 py-1 text-lg"
              aria-label="Nächster Tag"
            >
              →
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-stone-300 hover:text-stone-500 transition-colors text-xs ml-1"
                aria-label="Abmelden"
                title="Abmelden"
              >
                ⏏
              </button>
            )}
          </div>
        </nav>

        {/* Saisonbezeichnung + Tagesname */}
        <header className="mb-10">
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-3 ${c.accent}`}>
            {SEASON_NAMES[day.season] ?? day.season}
          </p>
          <h1 className="font-serif text-3xl leading-snug text-stone-800">
            {day.name}
          </h1>
          {!day.isFeastDay && day.governingSunday && (
            <p className="font-serif text-sm text-stone-400 mt-1 italic">{day.governingSunday}</p>
          )}
        </header>

        {loading && (
          <p className="font-serif text-stone-400 text-base italic animate-pulse">Wird geladen …</p>
        )}

        {!loading && !content && (
          <div className="border border-stone-200 rounded px-5 py-4">
            <p className="font-serif text-stone-500 text-base italic">
              Für diesen Tag ist noch kein Inhalt hinterlegt.
            </p>
          </div>
        )}

        {content && (
          <article>

            {/* Eröffnung */}
            <section>
              <Rubric label="Eröffnung" accent={c.accent} />
              <p className="font-serif text-[17px] leading-[1.85] text-stone-700 italic">
                Im Namen des Vaters und des Sohnes und des Heiligen Geistes. Amen.
              </p>
            </section>

            {/* Evangelium */}
            {content.readings.gospel && (
              <>
                <Ornament color={c.divider} />
                <section>
                  <Rubric label={`Evangelium  ·  ${content.readings.gospel.ref}`} accent={c.accent} />
                  {content.readings.gospel.text
                    ? <p className="font-serif text-[17px] leading-[1.85] text-stone-800">{content.readings.gospel.text}</p>
                    : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>}
                </section>
              </>
            )}

            {/* Epistel */}
            {content.readings.epistle && (
              <>
                <Ornament color={c.divider} />
                <section>
                  <Rubric label={`Epistel  ·  ${content.readings.epistle.ref}`} accent={c.accent} />
                  {content.readings.epistle.text
                    ? <p className="font-serif text-[17px] leading-[1.85] text-stone-800">{content.readings.epistle.text}</p>
                    : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>}
                </section>
              </>
            )}

            {/* Psalm */}
            {content.readings.psalm && (
              <>
                <Ornament color={c.divider} />
                <section>
                  <Rubric label={`Psalm  ·  ${content.readings.psalm.ref}`} accent={c.accent} />
                  {content.readings.psalm.text
                    ? <p className="font-serif text-[17px] leading-[1.85] text-stone-700 italic">{content.readings.psalm.text}</p>
                    : <p className="font-serif text-stone-400 italic">Text noch nicht verfügbar.</p>}
                </section>
              </>
            )}

            {/* Andacht */}
            {content.devotion && (
              <>
                <Ornament color={c.divider} />
                <section>
                  <Rubric label="Andacht" accent={c.accent} />
                  <p className="font-serif text-[17px] leading-[1.85] text-stone-800">{content.devotion.text}</p>
                  <ProvenanceNote block={content.devotion} />
                </section>
              </>
            )}

            {/* Lied */}
            {content.hymn && (
              <>
                <Ornament color={c.divider} />
                <section>
                  <Rubric label={`Lied  ·  ${content.hymn.title}`} accent={c.accent} />
                  {(content.hymn.stanzas ?? []).map((stanza, i) => (
                    <p key={i} className="font-serif text-[17px] leading-[1.85] text-stone-700 whitespace-pre-line mb-4 last:mb-0">
                      {stanza}
                    </p>
                  ))}
                  <ProvenanceNote block={content.hymn} />
                </section>
              </>
            )}

            {/* Kollekte */}
            {content.collect && (
              <>
                <Ornament color={c.divider} />
                <section>
                  <Rubric label="Kollekte" accent={c.accent} />
                  <p className="font-serif text-[17px] leading-[1.85] text-stone-700 italic">{content.collect.text}</p>
                </section>
              </>
            )}

            {/* Katechismus */}
            {content.catechism_segment && (
              <>
                <Ornament color={c.divider} />
                <section>
                  <Rubric label={`Katechismus  ·  ${content.catechism_segment.part}`} accent={c.accent} />
                  <p className="font-serif text-[17px] leading-[1.85] text-stone-800">{content.catechism_segment.text}</p>
                </section>
              </>
            )}

            {/* Segen */}
            <Ornament color={c.divider} />
            <section>
              <Rubric label="Segen" accent={c.accent} />
              <p className="font-serif text-[17px] leading-[1.85] text-stone-700 italic">
                Der Herr segne dich und behüte dich; der Herr lasse sein Angesicht leuchten über dir und sei dir gnädig; der Herr erhebe sein Angesicht über dich und gebe dir Frieden. Amen.
              </p>
            </section>

            {/* Quellenangabe */}
            <p className="font-serif text-xs text-stone-300 mt-10 mb-4 italic">
              Bibeltext: Lutherbibel 1912 (gemeinfrei)
            </p>

          </article>
        )}
      </div>
    </div>
  )
}
