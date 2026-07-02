import type { ActivityMap } from '../hooks/useActivity'

const MONTHS = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']

const COLORS = [
  '#e7e5e4', // stone-200: kein Besuch
  '#bbf7d0', // green-200: geöffnet
  '#4ade80', // green-400: gelesen
  '#16a34a', // green-600: Notiz geschrieben
]

const LABELS = ['', 'Geöffnet', 'Gelesen', 'Notiz']

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function buildGrid() {
  const today = new Date()
  const todayIso = isoDate(today)

  // Montag der aktuellen Woche
  const dow = today.getDay()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))

  // 51 Wochen zurück
  const start = new Date(weekStart)
  start.setDate(start.getDate() - 51 * 7)

  const weeks: { date: Date; iso: string }[][] = []
  const cursor = new Date(start)

  for (let w = 0; w < 52; w++) {
    const week: { date: Date; iso: string }[] = []
    for (let d = 0; d < 7; d++) {
      week.push({ date: new Date(cursor), iso: isoDate(cursor) })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  return { weeks, todayIso }
}

function monthLabels(weeks: { date: Date; iso: string }[][]) {
  const labels: { label: string; col: number }[] = []
  let last = -1
  weeks.forEach((week, col) => {
    const m = week[0].date.getMonth()
    if (m !== last) { labels.push({ label: MONTHS[m], col }); last = m }
  })
  return labels
}

interface Props {
  activity: ActivityMap
}

const CELL = 11   // px pro Zelle
const GAP  = 3    // px Abstand

export function YearGrid({ activity }: Props) {
  const { weeks, todayIso } = buildGrid()
  const labels = monthLabels(weeks)
  const totalWidth = weeks.length * (CELL + GAP) - GAP

  return (
    <div style={{ width: totalWidth }} className="overflow-x-auto">

      {/* Monatsbeschriftungen */}
      <div className="relative mb-1" style={{ height: 16, width: totalWidth }}>
        {labels.map(({ label, col }) => (
          <span
            key={`${label}-${col}`}
            className="absolute font-serif text-[10px] text-stone-400"
            style={{ left: col * (CELL + GAP) }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Raster */}
      <div className="flex" style={{ gap: GAP }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
            {week.map(({ date, iso }) => {
              const level = activity[iso] ?? 0
              const future = iso > todayIso
              return (
                <div
                  key={iso}
                  title={future ? '' : `${date.getDate()}. ${MONTHS[date.getMonth()]}${level > 0 ? ` · ${LABELS[level]}` : ''}`}
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 2,
                    backgroundColor: future ? 'transparent' : COLORS[level],
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legende */}
      <div className="flex items-center gap-2 mt-3">
        <span className="font-serif text-[10px] text-stone-400">weniger</span>
        {COLORS.map((color, i) => (
          <div
            key={i}
            style={{ width: CELL, height: CELL, borderRadius: 2, backgroundColor: color }}
          />
        ))}
        <span className="font-serif text-[10px] text-stone-400">mehr</span>
      </div>

    </div>
  )
}
