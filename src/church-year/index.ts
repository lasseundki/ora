// Kirchenjahr-Engine — historische lutherische Einjahresordnung (Eisenacher Ordnung)

export type Season =
  | 'advent'
  | 'weihnachten'
  | 'epiphanias'
  | 'vorfasten'
  | 'passion'
  | 'ostern'
  | 'pfingsten'
  | 'trinitatis'

export type LiturgicalColor = 'violet' | 'white' | 'green' | 'red' | 'black'

export interface LiturgicalDay {
  date: string
  name: string
  governingSunday: string
  /** ID der zugehörigen content/de/<id>.json — null wenn kein Content-File erwartet */
  contentId: string
  season: Season
  color: LiturgicalColor
  week: number | null
  isFeastDay: boolean
}

interface Entry {
  date: Date
  name: string
  id: string
  season: Season
  color: LiturgicalColor
  week: number | null
}

const DAY_MS = 86_400_000
const addDays = (d: Date, n: number): Date => new Date(d.getTime() + n * DAY_MS)
const isoDate = (d: Date): string => d.toISOString().slice(0, 10)

// Computus: Osterdatum (Meeus/Jones/Butcher, gregorianisch)
export function easterDate(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day   = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(year, month - 1, day))
}

// Advent 1 = 4. Sonntag vor dem 25. Dezember
function advent1(year: number): Date {
  const xmas = new Date(Date.UTC(year, 11, 25))
  const dow  = xmas.getUTCDay()
  return addDays(xmas, -(dow === 0 ? 21 : dow + 21))
}

// Erster Sonntag nach Weihnachten (27.–31. Dez), falls vorhanden
function sundayAfterXmas(year: number): Date | null {
  for (let offset = 2; offset <= 7; offset++) {
    const d = new Date(Date.UTC(year, 11, 25 + offset))
    if (d.getUTCDay() === 0 && d.getUTCDate() <= 31) return d
  }
  return null
}

function buildYear(civilYear: number): Entry[] {
  const entries: Entry[] = []
  const push = (date: Date, name: string, id: string, season: Season, color: LiturgicalColor, week: number | null = null) =>
    entries.push({ date, name, id, season, color, week })

  for (const baseYear of [civilYear - 1, civilYear]) {
    // --- Advent ---
    const adv1 = advent1(baseYear)
    push(adv1,                 '1. Sonntag im Advent', 'advent-1', 'advent', 'violet', 1)
    push(addDays(adv1,  7),    '2. Sonntag im Advent', 'advent-2', 'advent', 'violet', 2)
    push(addDays(adv1, 14),    '3. Sonntag im Advent', 'advent-3', 'advent', 'violet', 3)
    push(addDays(adv1, 21),    '4. Sonntag im Advent', 'advent-4', 'advent', 'violet', 4)

    // --- Weihnachten ---
    push(new Date(Date.UTC(baseYear, 11, 25)), 'Christfest (1. Weihnachtstag)', 'christfest-1', 'weihnachten', 'white')
    push(new Date(Date.UTC(baseYear, 11, 26)), '2. Weihnachtstag (Stephanus)',  'christfest-2', 'weihnachten', 'red')

    const sunAfterXmas = sundayAfterXmas(baseYear)
    if (sunAfterXmas) push(sunAfterXmas, 'Sonntag nach Weihnachten', 'sonntag-nach-weihnachten', 'weihnachten', 'white')

    push(new Date(Date.UTC(baseYear + 1, 0, 1)), 'Neujahr (Beschneidung des Herrn)', 'neujahr', 'weihnachten', 'white')

    // --- Epiphanias ---
    push(new Date(Date.UTC(baseYear + 1, 0, 6)), 'Epiphanias', 'epiphanias', 'epiphanias', 'white')

    const epi6Jan = new Date(Date.UTC(baseYear + 1, 0, 6))
    const dowEpi  = epi6Jan.getUTCDay()
    const epi1Sun = addDays(epi6Jan, dowEpi === 0 ? 7 : 7 - dowEpi)
    const e = easterDate(baseYear + 1)

    for (let n = 1; n <= 6; n++) {
      const d = addDays(epi1Sun, (n - 1) * 7)
      if (d.getTime() < addDays(e, -63).getTime())
        push(d, `${n}. Sonntag nach Epiphanias`, `epiphanias-${n}`, 'epiphanias', 'green', n)
    }

    // --- Vorfasten ---
    push(addDays(e, -63), 'Septuagesimae',             'septuagesimae', 'vorfasten', 'green')
    push(addDays(e, -56), 'Sexagesimae',                'sexagesimae',   'vorfasten', 'green')
    push(addDays(e, -49), 'Estomihi (Quinquagesimae)', 'estomihi',       'vorfasten', 'green')

    // --- Passionszeit ---
    push(addDays(e, -46), 'Aschermittwoch',             'aschermittwoch', 'passion', 'violet')
    push(addDays(e, -42), 'Invocavit',                  'invocavit',      'passion', 'violet', 1)
    push(addDays(e, -35), 'Reminiscere',                'reminiscere',    'passion', 'violet', 2)
    push(addDays(e, -28), 'Oculi',                      'oculi',          'passion', 'violet', 3)
    push(addDays(e, -21), 'Laetare',                    'laetare',        'passion', 'violet', 4)
    push(addDays(e, -14), 'Judica',                     'judica',         'passion', 'violet', 5)
    push(addDays(e,  -7), 'Palmarum (Palmsonntag)',     'palmarum',       'passion', 'violet', 6)
    push(addDays(e,  -3), 'Gründonnerstag',             'gruendonnerstag','passion', 'white')
    push(addDays(e,  -2), 'Karfreitag',                 'karfreitag',     'passion', 'black')

    // --- Osterzeit ---
    push(e,               'Ostersonntag',         'ostersonntag',    'ostern', 'white')
    push(addDays(e,  1),  'Ostermontag',          'ostermontag',     'ostern', 'white')
    push(addDays(e,  7),  'Quasimodogeniti',      'quasimodogeniti', 'ostern', 'white', 1)
    push(addDays(e, 14),  'Misericordias Domini', 'misericordias',   'ostern', 'white', 2)
    push(addDays(e, 21),  'Jubilate',             'jubilate',        'ostern', 'white', 3)
    push(addDays(e, 28),  'Cantate',              'cantate',         'ostern', 'white', 4)
    push(addDays(e, 35),  'Rogate',               'rogate',          'ostern', 'white', 5)
    push(addDays(e, 39),  'Christi Himmelfahrt',  'himmelfahrt',     'ostern', 'white')
    push(addDays(e, 42),  'Exaudi',               'exaudi',          'ostern', 'white', 6)

    // --- Pfingsten / Trinitatis ---
    push(addDays(e, 49), 'Pfingstsonntag', 'pfingstsonntag', 'pfingsten', 'red')
    push(addDays(e, 50), 'Pfingstmontag',  'pfingstmontag',  'pfingsten', 'red')
    push(addDays(e, 56), 'Trinitatis',     'trinitatis',     'trinitatis', 'white')

    const nextAdv = advent1(baseYear + 1)
    for (let n = 1; n <= 27; n++) {
      const d = addDays(e, 56 + n * 7)
      if (d.getTime() < nextAdv.getTime())
        push(d, `${n}. Sonntag nach Trinitatis`, `trinitatis-${n}`, 'trinitatis', 'green', n)
    }
  }

  entries.sort((a, b) => a.date.getTime() - b.date.getTime())
  return entries
}

// Hauptfunktion: Datum → liturgischer Kontext
export function liturgicalDay(date: Date): LiturgicalDay | null {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const entries = buildYear(d.getUTCFullYear())
  let governing: Entry | null = null
  for (const en of entries) {
    if (en.date.getTime() <= d.getTime()) governing = en
    else break
  }
  if (!governing) return null
  const isFeastDay = governing.date.getTime() === d.getTime()
  return {
    date: isoDate(d),
    name: isFeastDay ? governing.name : `Woche nach ${governing.name}`,
    governingSunday: governing.name,
    contentId: governing.id,
    season: governing.season,
    color: governing.color,
    week: governing.week,
    isFeastDay,
  }
}
