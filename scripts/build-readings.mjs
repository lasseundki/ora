// Content-Pipeline: Perikopentabelle + Vers-Index → content/de/<id>.json
// Voraussetzung: scripts/source/verse-index.json muss existieren (node scripts/parse-osis.mjs).
// Aufruf: node scripts/build-readings.mjs
//
// Was das Skript tut:
//  - Liest perikopenordnung.json (Lesungsreferenzen pro liturgischem Tag).
//  - Löst jede Referenz im Vers-Index auf und setzt den Volltext ein.
//  - Legt content/de/<id>.json an oder ergänzt eine bestehende Datei
//    (überschreibt nur die readings-Felder, lässt devotion/hymn/collect unberührt).
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir  = dirname(fileURLToPath(import.meta.url))
const root   = join(__dir, '..')

const perikopenPath  = join(__dir, 'data', 'perikopenordnung.json')
const indexPath      = join(__dir, 'source', 'verse-index.json')
const contentDir     = join(root, 'public', 'content', 'de')

// --- Buchabkürzungen (Deutsch → OSIS-ID) ---
const BOOK_MAP = {
  // AT
  '1Mose': 'Gen', 'Gen': 'Gen', 'Genesis': 'Gen',
  '2Mose': 'Exod', 'Exod': 'Exod', 'Exodus': 'Exod',
  'Ps': 'Ps', 'Psalm': 'Ps', 'Psalmen': 'Ps',
  'Jes': 'Isa', 'Jesaja': 'Isa',
  'Jer': 'Jer', 'Jeremia': 'Jer',
  'Hes': 'Ezek', 'Hesekiel': 'Ezek',
  'Dan': 'Dan',
  'Mal': 'Mal',
  // NT
  'Matt': 'Matt', 'Mt': 'Matt', 'Matthäus': 'Matt',
  'Mark': 'Mark', 'Mk': 'Mark', 'Markus': 'Mark',
  'Lk': 'Luke', 'Lukas': 'Luke', 'Luke': 'Luke',
  'Joh': 'John', 'Johannes': 'John',
  'Apg': 'Acts', 'Apostelgeschichte': 'Acts',
  'Röm': 'Rom', 'Römer': 'Rom',
  '1Kor': '1Cor', '1Korinther': '1Cor',
  '2Kor': '2Cor', '2Korinther': '2Cor',
  'Gal': 'Gal', 'Galater': 'Gal',
  'Eph': 'Eph', 'Epheser': 'Eph',
  'Phil': 'Phil', 'Philipper': 'Phil',
  'Kol': 'Col', 'Kolosser': 'Col',
  '1Thess': '1Thess',
  '2Thess': '2Thess',
  '1Tim': '1Tim',
  '2Tim': '2Tim',
  'Tit': 'Titus', 'Titus': 'Titus',
  'Hebr': 'Heb', 'Hebräer': 'Heb',
  'Jak': 'Jas', 'Jakobus': 'Jas',
  '1Petr': '1Pet', '1Petrus': '1Pet',
  '2Petr': '2Pet', '2Petrus': '2Pet',
  '1Joh': '1John',
  '2Joh': '2John',
  '3Joh': '3John',
  'Offb': 'Rev', 'Offenbarung': 'Rev',
}

// --- Referenz-Parser: "Lk 21,25-36" → { osisBook, chapter, fromVerse, toVerse, fullChapter } ---
function parseRef(ref) {
  // Unterstützte Formate: "Lk 21,25-36" | "Matt 2,1-12" | "Ps 24" | "Lk 2,21"
  // Mehrteilige Referenzen (z.B. "Apg 6,8-14; 7,54-60") → nur erster Teil
  const primary = ref.split(';')[0].trim()
  const m = primary.match(/^(\S+)\s+(\d+)(?:,(\d+)(?:-(\d+))?)?$/)
  if (!m) return null
  const [, bookAbbr, chapterStr, fromStr, toStr] = m
  const osisBook = BOOK_MAP[bookAbbr]
  if (!osisBook) { console.warn(`  Unbekannte Buchabkürzung: "${bookAbbr}" in "${ref}"`); return null }
  const chapter     = parseInt(chapterStr, 10)
  const fullChapter = !fromStr // "Ps 24" ohne Versangabe → ganzes Kapitel
  const fromVerse   = fromStr ? parseInt(fromStr, 10) : 1
  const toVerse     = toStr   ? parseInt(toStr,   10) : fromVerse
  return { osisBook, chapter, fromVerse, toVerse, fullChapter }
}

// --- Verse aus Index holen ---
function extractVerses(index, parsed) {
  if (!parsed) return null
  const { osisBook, chapter, fromVerse, toVerse, fullChapter } = parsed
  const verses = []
  const limit = fullChapter ? 200 : toVerse // ganzes Kapitel: bis kein Vers mehr vorhanden
  for (let v = fromVerse; v <= limit; v++) {
    const key = `${osisBook}.${chapter}.${v}`
    if (index[key]) {
      verses.push(index[key])
    } else if (verses.length === 0 && fullChapter) {
      // Manche Psalmen beginnen erst bei Vers 2 (kein Vers 1 im OSIS)
      continue
    } else {
      break // Kapitelende
    }
  }
  return verses.length ? verses.join(' ') : null
}

// --- Hauptlogik ---
function buildReadingObj(index, readingEntry) {
  if (!readingEntry?.ref) return readingEntry
  const parsed = parseRef(readingEntry.ref)
  const text   = extractVerses(index, parsed)
  const result = { ...readingEntry }
  if (text) {
    result.text = text
    result.source   = 'Lutherbibel 1912'
    result.license  = 'public-domain'
    result.public_domain = true
  } else {
    console.warn(`  Kein Text gefunden für: ${readingEntry.ref}`)
  }
  return result
}

const perikopen = JSON.parse(readFileSync(perikopenPath, 'utf8'))
const index     = JSON.parse(readFileSync(indexPath, 'utf8'))

let created = 0; let updated = 0

for (const day of perikopen.days) {
  const outFile = join(contentDir, `${day.id}.json`)
  let existing = {}
  if (existsSync(outFile)) {
    existing = JSON.parse(readFileSync(outFile, 'utf8'))
    updated++
  } else {
    created++
  }

  const readings = {}
  for (const [role, entry] of Object.entries(day.readings)) {
    readings[role] = buildReadingObj(index, entry)
  }

  const merged = {
    id:      day.id,
    name:    day.name,
    season:  day.season,
    color:   day.color,
    rank:    day.rank,
    lang:    'de',
    ...existing,          // bestehende Felder (devotion, hymn, collect …) bleiben erhalten
    readings,             // readings werden überschrieben
  }

  writeFileSync(outFile, JSON.stringify(merged, null, 2) + '\n', 'utf8')
  console.log(`  ${existsSync(outFile) ? 'aktualisiert' : 'erstellt'}: content/de/${day.id}.json`)
}

console.log(`\nFertig: ${created} erstellt, ${updated} aktualisiert.`)
console.log('HINWEIS: Perikopen-Referenzen gegen historische Agende verifizieren (perikopenordnung.json).')
