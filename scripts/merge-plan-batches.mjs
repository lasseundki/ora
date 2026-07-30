// Führt die einzeln übersetzten Batch-Dateien (scripts/source/cptln-import/batches/de-out/)
// zu je einer Gesamtdatei pro Plan zusammen und legt sie unter public/content/plans/<planId>/de.json
// ab (Fetch-Konvention analog zu public/content/de/<slug>.json, siehe src/hooks/useDayContent.ts).
//
// Aufruf: node scripts/merge-plan-batches.mjs

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const BATCH_DIR = join(__dir, 'source', 'cptln-import', 'batches', 'de-out')
const OUT_ROOT = join(__dir, '..', 'public', 'content', 'plans')

const PLANS = [
  { prefix: '5min-', count: 30, planId: '5-minutos-con-jesus', extraFiles: [] },
  {
    prefix: 'camino-',
    count: 26,
    planId: 'para-el-camino',
    // camino-01..03 wurden vor einer Neuerzeugung der Quell-Batches (rollierendes 365-Tage-
    // Fenster ist weitergerutscht) übersetzt — dadurch überlappen sich camino-03 (alt) und
    // camino-04 (neu erzeugt) auf 3 Tagen, und 3 neuere Tage fehlten komplett. Patch-Datei
    // ergänzt die fehlenden 3; bei Überlappung gewinnt die später verarbeitete (neuere) Datei
    // (id-basiertes "letzter gewinnt"-Dedup unten), da id = "<planId>-<date>" ist.
    extraFiles: ['camino-missing-20260721-23.json'],
  },
]

const REQUIRED_FIELDS = ['id', 'date', 'planId', 'lang', 'title', 'body', 'author', 'source', 'license', 'public_domain']

for (const plan of PLANS) {
  const byId = new Map()
  const files = [
    ...Array.from({ length: plan.count }, (_, i) => `${plan.prefix}${String(i + 1).padStart(2, '0')}.json`),
    ...plan.extraFiles,
  ]
  for (const fname of files) {
    const file = join(BATCH_DIR, fname)
    const batch = JSON.parse(readFileSync(file, 'utf8'))
    for (const e of batch) {
      for (const f of REQUIRED_FIELDS) {
        if (e[f] === undefined) throw new Error(`${file}: Eintrag ${e.id ?? '?'} fehlt Feld "${f}"`)
      }
      byId.set(e.id, e) // später verarbeitete Datei überschreibt frühere (letzter gewinnt)
    }
  }
  const entries = [...byId.values()]
  entries.sort((a, b) => a.date.localeCompare(b.date))

  const outDir = join(OUT_ROOT, plan.planId)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'de.json'), JSON.stringify(entries, null, 2) + '\n', 'utf8')
  console.log(`${plan.planId}: ${entries.length} Einträge → public/content/plans/${plan.planId}/de.json (${entries[0].date} … ${entries[entries.length - 1].date})`)
}
