// Löst die "reference"-Angabe jedes Eintrags gegen die Luther-1912-Bibel auf
// (scripts/source/verse-index.json, dieselbe Quelle, die Ora für den gemeinfreien
// Kern nutzt) und ergänzt den ECHTEN deutschen Bibeltext + korrekt formatierte
// Referenz. Übersetzungs-Agenten sollen diesen Text VERWENDEN, nicht selbst
// übersetzen — siehe Uebersetzungsstil-DE.md.
//
// Aufruf: node scripts/resolve-bible-quotes.mjs <input.json> <lang: pt|es>
// Schreibt <input>.bible-resolved.json daneben.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { findBook, deBookName } from './bible-books.mjs'

const __dir = dirname(fileURLToPath(import.meta.url))
const [, , inputPath, lang] = process.argv
if (!inputPath || !lang) {
  console.error('Aufruf: node scripts/resolve-bible-quotes.mjs <input.json> <pt|es>')
  process.exit(1)
}

const idx = JSON.parse(readFileSync(join(__dir, 'source', 'verse-index.json'), 'utf8'))
const entries = JSON.parse(readFileSync(inputPath, 'utf8'))

function parseReference(refRaw) {
  if (!refRaw) return null
  let ref = refRaw.replace(/^ver\s+/i, '').trim()
  ref = ref.replace(/[ªº*]/g, '') // Fußnotenmarker
  ref = ref.replace(/[–—]/g, '-') // En-/Em-Dash vereinheitlichen

  const ONE_CHAPTER_BOOKS = new Set(['Obad', 'Phlm', '2John', '3John', 'Jude'])

  let head = ref.match(/^([1-3]?\s?[^\d]+?)\s*(\d+)/)
  if (!head) {
    // Bücher mit nur einem Kapitel werden manchmal ohne Kapitelzahl zitiert (z.B. "3João 5-8")
    const bareBook = findBook(ref.replace(/[\d.,:\s-]+$/, '').trim() || ref.trim(), lang)
    if (bareBook && ONE_CHAPTER_BOOKS.has(bareBook.osis)) {
      const verseNums = [...ref.matchAll(/\d+/g)].map((m) => parseInt(m[0], 10))
      return {
        osis: bareBook.osis,
        chapter: 1,
        start: verseNums.length ? Math.min(...verseNums) : null,
        end: verseNums.length ? Math.max(...verseNums) : null,
      }
    }
    return null
  }
  const book = findBook(head[1].trim(), lang)
  if (!book) return null
  const chapter = parseInt(head[2], 10)

  const rest = ref.slice(head[0].length)
  // Kapitelübergreifende Referenzen (z.B. "3.23-4.7", "26.1-27.66") nicht unterstützt
  if (/^\s*[.,:]\s*\d+\s*-\s*\d+\s*\.\s*\d+/.test(rest)) return null

  const verseNums = [...rest.matchAll(/\d+/g)].map((m) => parseInt(m[0], 10))
  if (!verseNums.length) return { osis: book.osis, chapter, start: null, end: null }
  // Bei Mehrfachbereichen (z.B. "1, 19-29") wird die umfassende Spanne genommen,
  // nicht nur die exakt genannten Verse — bewusste Vereinfachung.
  return { osis: book.osis, chapter, start: Math.min(...verseNums), end: Math.max(...verseNums) }
}

function lookupVerses(osis, chapter, start, end) {
  if (start == null) {
    const verses = []
    let v = 1
    while (idx[`${osis}.${chapter}.${v}`] !== undefined) {
      verses.push(v)
      v++
    }
    if (!verses.length) return null
    start = 1
    end = verses[verses.length - 1]
  }
  const texts = []
  for (let v = start; v <= end; v++) {
    const key = `${osis}.${chapter}.${v}`
    if (idx[key] === undefined) return null
    texts.push(idx[key])
  }
  return { text: texts.join(' '), start, end }
}

function formatDeReference(deBook, chapter, start, end) {
  if (start == null) return `${deBook} ${chapter}`
  if (start === end) return `${deBook} ${chapter},${start}`
  return `${deBook} ${chapter},${start}-${end}`
}

let resolved = 0
let failed = 0
const failures = []

for (const e of entries) {
  const parsed = parseReference(e.reference)
  if (!parsed) {
    e.quote_de_luther1912 = null
    e.reference_de = null
    e.quote_bible_edition = null
    if (e.reference) failures.push({ id: e.id, reference: e.reference, reason: 'unparsable' })
    failed++
    continue
  }
  const result = lookupVerses(parsed.osis, parsed.chapter, parsed.start, parsed.end)
  if (!result) {
    e.quote_de_luther1912 = null
    e.reference_de = null
    e.quote_bible_edition = null
    failures.push({ id: e.id, reference: e.reference, reason: 'not_in_index', osis: parsed.osis, chapter: parsed.chapter })
    failed++
    continue
  }
  e.quote_de_luther1912 = result.text
  e.reference_de = formatDeReference(deBookName(parsed.osis), parsed.chapter, result.start, result.end)
  e.quote_bible_edition = 'Lutherbibel 1912'
  resolved++
}

const outPath = inputPath.replace(/\.json$/, '.bible-resolved.json')
writeFileSync(outPath, JSON.stringify(entries, null, 2) + '\n', 'utf8')

const withRef = entries.filter((e) => e.reference).length
console.log(`${basename(inputPath)}: ${withRef} mit Referenz, davon aufgelöst: ${resolved}, fehlgeschlagen: ${failed}`)
if (failures.length) {
  writeFileSync(
    outPath.replace('.bible-resolved.json', '.bible-lookup-failures.json'),
    JSON.stringify(failures, null, 2) + '\n',
    'utf8',
  )
  console.log(`  → Details zu Fehlschlägen in ${basename(outPath).replace('.bible-resolved.json', '.bible-lookup-failures.json')}`)
}
