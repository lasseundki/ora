import { useState, useMemo } from 'react'
import { liturgicalDay } from '../church-year'
import { getColors, SEASON_NAMES } from './colors'

const DOW_SHORT    = ['So','Mo','Di','Mi','Do','Fr','Sa']
const MONTHS_SHORT = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

// ISO-Woche: Montag bis Sonntag
function weekDates(anchor: Date): Date[] {
  const dow = anchor.getDay() // 0=So
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - (dow === 0 ? 6 : dow - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

interface Props {
  onSelectDay: (date: Date) => void
}

export function WeekView({ onSelectDay }: Props) {
  const [weekOffset, setWeekOffset] = useState(0)
  const today    = new Date()
  const todayIso = isoDate(today)

  const anchor = useMemo(() => {
    const d = new Date(today)
    d.setDate(today.getDate() + weekOffset * 7)
    return d
  }, [today, weekOffset])

  const days = useMemo(() =>
    weekDates(anchor).map(date => ({
      date,
      iso: isoDate(date),
      lit: liturgicalDay(date),
    })),
  [anchor])

  // Farbstreifen oben: Farbe des heutigen oder ersten bekannten Tages
  const todayLit = days.find(d => d.iso === todayIso)?.lit ?? days[0].lit
  const headerColor = todayLit ? getColors(todayLit.color).strip : 'bg-stone-200'

  // Wochenbeschriftung
  const first = days[0].date
  const last  = days[6].date
  const sameMonth = first.getMonth() === last.getMonth()
  const weekLabel = sameMonth
    ? `${first.getDate()}. – ${last.getDate()}. ${MONTHS_SHORT[last.getMonth()]} ${last.getFullYear()}`
    : `${first.getDate()}. ${MONTHS_SHORT[first.getMonth()]} – ${last.getDate()}. ${MONTHS_SHORT[last.getMonth()]} ${last.getFullYear()}`

  // Leitender Sonntag für diese Woche (der häufigste governingSunday)
  const governingSunday = days
    .map(d => d.lit?.governingSunday)
    .filter(Boolean)
    .reduce<Record<string, number>>((acc, s) => { acc[s!] = (acc[s!] ?? 0) + 1; return acc }, {})
  const dominantSunday = Object.entries(governingSunday).sort((a, b) => b[1] - a[1])[0]?.[0]
  const dominantSeason = days.find(d => d.lit?.governingSunday === dominantSunday)?.lit?.season

  return (
    <div className="min-h-screen bg-[#f8f4ee]">
      <div className={`h-1 w-full ${headerColor}`} />

      <div className="max-w-xl mx-auto px-6 py-8">

        {/* Header */}
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-1">
          Wochenübersicht
        </p>

        {/* Wochennavigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="text-stone-400 hover:text-stone-700 transition-colors text-lg px-1"
            aria-label="Vorherige Woche"
          >←</button>
          <span className="font-serif text-[14px] text-stone-600">{weekLabel}</span>
          <button
            onClick={() => setWeekOffset(o => o + 1)}
            className="text-stone-400 hover:text-stone-700 transition-colors text-lg px-1"
            aria-label="Nächste Woche"
          >→</button>
        </div>

        {/* Leitender Sonntag */}
        {dominantSunday && dominantSeason && (
          <div className="mb-5">
            <p className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-0.5 ${
              days.find(d => d.lit?.season === dominantSeason)
                ? getColors(days.find(d => d.lit?.season === dominantSeason)!.lit!.color).accent
                : 'text-stone-400'
            }`}>
              {SEASON_NAMES[dominantSeason] ?? dominantSeason}
            </p>
            <p className="font-serif text-lg text-stone-700">{dominantSunday}</p>
          </div>
        )}

        {/* Tagesliste */}
        <div className="flex flex-col gap-2">
          {days.map(({ date, iso, lit }) => {
            const isToday = iso === todayIso
            const isFeast = lit?.isFeastDay ?? false
            const c = lit ? getColors(lit.color) : null

            return (
              <button
                key={iso}
                onClick={() => onSelectDay(date)}
                className={[
                  'flex items-center gap-3 text-left rounded-lg px-4 py-3 transition-colors border',
                  isToday
                    ? 'bg-white border-stone-300 shadow-sm'
                    : 'bg-white/40 border-stone-100 hover:bg-white/70',
                ].join(' ')}
              >
                {/* Liturgischer Farbbalken */}
                <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${c?.strip ?? 'bg-stone-200'}`} />

                {/* Wochentag + Datum */}
                <div className="w-10 flex-shrink-0 text-center">
                  <p className={`font-serif text-[11px] font-bold uppercase tracking-wide ${isToday ? 'text-stone-700' : 'text-stone-400'}`}>
                    {DOW_SHORT[date.getDay()]}
                  </p>
                  <p className={`font-serif text-xl leading-none mt-0.5 ${isToday ? 'text-stone-800' : 'text-stone-400'}`}>
                    {date.getDate()}.
                  </p>
                </div>

                {/* Liturgischer Name */}
                <div className="flex-1 min-w-0">
                  {isFeast ? (
                    <p className={`font-serif text-[15px] leading-snug ${isToday ? 'text-stone-800' : 'text-stone-600'}`}>
                      {lit!.name}
                    </p>
                  ) : (
                    <>
                      <p className={`font-serif text-[13px] ${isToday ? 'text-stone-700' : 'text-stone-400'}`}>
                        {lit?.governingSunday ?? '—'}
                      </p>
                      <p className="font-serif text-[11px] text-stone-300">Wochentag</p>
                    </>
                  )}
                </div>

                {/* Heute-Badge oder Pfeil */}
                {isToday ? (
                  <span className="font-serif text-[10px] font-bold uppercase tracking-wide text-stone-500 flex-shrink-0">Heute</span>
                ) : (
                  <span className="text-stone-200 text-sm flex-shrink-0">→</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Zurück zur aktuellen Woche */}
        {weekOffset !== 0 && (
          <button
            onClick={() => setWeekOffset(0)}
            className="mt-5 w-full font-serif text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Zurück zur aktuellen Woche
          </button>
        )}

      </div>
    </div>
  )
}
