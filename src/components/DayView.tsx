import type { LiturgicalDay } from '../church-year'
import type { DayContent } from '../types/content'
import { getColors, SEASON_NAMES } from './colors'

// --- kleine Hilfs-Komponenten ---

function Section({ title, accent, border, children }: {
  title: string; accent: string; border: string; children: React.ReactNode
}) {
  return (
    <section className={`border-t pt-5 pb-2 ${border}`}>
      <h2 className={`text-xs font-semibold uppercase tracking-widest mb-3 ${accent}`}>{title}</h2>
      {children}
    </section>
  )
}

function ProvenanceNote({ block }: { block: { author?: string; source?: string; year?: number } }) {
  const parts = [block.author, block.year ? String(block.year) : null].filter(Boolean)
  return parts.length || block.source ? (
    <p className="text-xs text-gray-400 mt-2 italic">
      {parts.join(', ')}{block.source ? ` — ${block.source}` : ''}
    </p>
  ) : null
}

// --- Hauptkomponente ---

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

export function DayView({ day, content, loading, date, onPrev, onNext, onLogout }: Props) {
  const c = getColors(day.color)
  const dateLabel = `${DOW[date.getDay()]}, ${date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}`

  return (
    <div className={`min-h-screen ${c.page}`}>
      {/* Liturgische Farbstreifen */}
      <div className={`h-2 w-full ${c.strip}`} />

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onPrev}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors text-gray-500"
            aria-label="Vorheriger Tag"
          >
            ←
          </button>
          <span className="text-sm text-gray-500">{dateLabel}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onNext}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors text-gray-500"
              aria-label="Nächster Tag"
            >
              →
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-black/5 transition-colors text-gray-400 text-xs ml-1"
                aria-label="Abmelden"
                title="Abmelden"
              >
                ⏏
              </button>
            )}
          </div>
        </div>

        {/* Saison-Badge + Tagesname */}
        <header className="mb-8">
          <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-3 ${c.badge}`}>
            {SEASON_NAMES[day.season] ?? day.season}
          </span>
          <h1 className={`text-2xl font-semibold leading-tight ${c.accent}`}>
            {day.name}
          </h1>
          {!day.isFeastDay && (
            <p className="text-sm text-gray-500 mt-1">{day.governingSunday}</p>
          )}
        </header>

        {loading && (
          <p className="text-gray-400 text-sm animate-pulse">Wird geladen …</p>
        )}

        {!loading && !content && (
          <div className={`rounded-lg border p-4 ${c.sectionBorder}`}>
            <p className="text-sm text-gray-500">
              Für diesen Tag ist noch kein Inhalt verfügbar.
            </p>
          </div>
        )}

        {content && (
          <div className="space-y-1">
            {/* Eröffnung */}
            <Section title="Eröffnung" accent={c.accent} border={c.sectionBorder}>
              <p className="leading-relaxed text-gray-700 italic">
                Im Namen des Vaters und des Sohnes und des Heiligen Geistes. Amen.
              </p>
            </Section>

            {/* Evangelium */}
            {content.readings.gospel && (
              <Section title={`Evangelium · ${content.readings.gospel.ref}`} accent={c.accent} border={c.sectionBorder}>
                {content.readings.gospel.text
                  ? <p className="leading-relaxed text-gray-800 text-[15px]">{content.readings.gospel.text}</p>
                  : <p className="text-gray-400 italic text-sm">Text noch nicht verfügbar.</p>}
              </Section>
            )}

            {/* Epistel */}
            {content.readings.epistle && (
              <Section title={`Epistel · ${content.readings.epistle.ref}`} accent={c.accent} border={c.sectionBorder}>
                {content.readings.epistle.text
                  ? <p className="leading-relaxed text-gray-800 text-[15px]">{content.readings.epistle.text}</p>
                  : <p className="text-gray-400 italic text-sm">Text noch nicht verfügbar.</p>}
              </Section>
            )}

            {/* Psalm */}
            {content.readings.psalm && (
              <Section title={`Psalm · ${content.readings.psalm.ref}`} accent={c.accent} border={c.sectionBorder}>
                {content.readings.psalm.text
                  ? <p className="leading-relaxed text-gray-700 text-[15px] italic">{content.readings.psalm.text}</p>
                  : <p className="text-gray-400 italic text-sm">Text noch nicht verfügbar.</p>}
              </Section>
            )}

            {/* Andacht */}
            {content.devotion && (
              <Section title="Andacht" accent={c.accent} border={c.sectionBorder}>
                <p className="leading-relaxed text-gray-800 text-[15px]">{content.devotion.text}</p>
                <ProvenanceNote block={content.devotion} />
              </Section>
            )}

            {/* Lied */}
            {content.hymn && (
              <Section title={`Lied · ${content.hymn.title}`} accent={c.accent} border={c.sectionBorder}>
                {(content.hymn.stanzas ?? []).map((stanza, i) => (
                  <p key={i} className="leading-relaxed text-gray-700 text-[15px] whitespace-pre-line mb-3 last:mb-0">
                    {stanza}
                  </p>
                ))}
                <ProvenanceNote block={content.hymn} />
              </Section>
            )}

            {/* Kollekte */}
            {content.collect && (
              <Section title="Kollekte" accent={c.accent} border={c.sectionBorder}>
                <p className="leading-relaxed text-gray-700 text-[15px] italic">{content.collect.text}</p>
              </Section>
            )}

            {/* Katechismus */}
            {content.catechism_segment && (
              <Section title={`Katechismus · ${content.catechism_segment.part}`} accent={c.accent} border={c.sectionBorder}>
                <p className="leading-relaxed text-gray-800 text-[15px]">{content.catechism_segment.text}</p>
              </Section>
            )}

            {/* Segen */}
            <Section title="Segen" accent={c.accent} border={c.sectionBorder}>
              <p className="leading-relaxed text-gray-700 italic">
                Der Herr segne dich und behüte dich; der Herr lasse sein Angesicht leuchten über dir und sei dir gnädig; der Herr erhebe sein Angesicht über dich und gebe dir Frieden. Amen.
              </p>
            </Section>

            {/* Bibeltext-Quellenangabe */}
            <p className="text-xs text-gray-300 pt-4 pb-2">
              Bibeltext: Lutherbibel 1912 (gemeinfrei)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
