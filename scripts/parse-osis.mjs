// Einmaliges Vorverarbeitungs-Skript: OSIS-XML → verse-index.json
// Aufruf: node scripts/parse-osis.mjs
// Ergebnis: scripts/source/verse-index.json   { "Luke.21.25": "text ...", ... }
//
// Das Index-File ist ~3 MB und wird von build-readings.mjs genutzt.
// Nicht ins Git einchecken (steht in .gitignore).
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const xmlPath  = join(__dir, 'source', 'deu-luther1912.osis.xml')
const outPath  = join(__dir, 'source', 'verse-index.json')

const VERSE_RE = /<verse osisID='([^']+)'>([^<]*)<\/verse>/

const index = {}
let count = 0

const rl = createInterface({ input: createReadStream(xmlPath, { encoding: 'utf8' }), crlfDelay: Infinity })

rl.on('line', (line) => {
  const m = line.match(VERSE_RE)
  if (m) {
    index[m[1]] = m[2].trim()
    count++
  }
})

rl.on('close', () => {
  writeFileSync(outPath, JSON.stringify(index, null, 0), 'utf8')
  console.log(`Vers-Index erstellt: ${count} Verse → ${outPath}`)
})
