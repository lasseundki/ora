// Importiert Andachtstexte aus einem WhatsApp-Gruppenchat-Export (Cong. Cristo Rey, IELPA/CPTLN Paraguay).
// Erkennt zwei bekannte Andachtsreihen an ihrer festen Textstruktur:
//   - "5 Minutos Com Jesus" (Hora Luterana Brasil, übersetzt von CPTLN Paraguay)
//   - "Para el Camino"
// Alles andere im Chat (Ankündigungen, Kondolenzen, Small Talk, private Anliegen) wird verworfen.
//
// Nutzungsrecht: Erlaubnis für "5 Minutos Com Jesus" von CPTLN eingeholt (Stand 2026-07-20).
// "Para el Camino" noch ausstehend — siehe scripts/Lizenzierte-Quellen.md.
// Vor Veröffentlichung prüfen, ob Rechte vorliegen (siehe dortige Tabelle).
//
// Aufruf: node scripts/import-cptln-chat.mjs [Pfad-zu-_chat.txt]

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const CHAT_PATH =
  process.argv[2] || 'C:/Users/Lasse/Downloads/WhatsApp Chat - Cong. Cristo Rey/_chat.txt'
const OUT_DIR = join(__dir, 'source', 'cptln-import')
mkdirSync(OUT_DIR, { recursive: true })

// WhatsApp fügt unsichtbare Bidi-/Formatierungszeichen ein (z. B. vor "~Name"); die stören beim Parsen.
const CTRL = /[\u200E\u200F\u2066-\u2069\u202A-\u202E]/g

const raw = readFileSync(CHAT_PATH, 'utf8').replace(CTRL, '')
const lines = raw.split(/\r?\n/)

const MSG_START = /^\[(\d{2})\.(\d{2})\.(\d{4}), (\d{2}):(\d{2}):(\d{2})\] ([^:]+): (.*)$/

const messages = []
let cur = null
for (const line of lines) {
  const m = line.match(MSG_START)
  if (m) {
    if (cur) messages.push(cur)
    const [, dd, mm, yyyy, hh, mi, ss, sender, rest] = m
    cur = { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}:${ss}`, sender: sender.trim(), lines: [rest] }
  } else if (cur) {
    cur.lines.push(line)
  }
}
if (cur) messages.push(cur)
for (const m of messages) {
  m.text = m.lines.join('\n').trim()
  delete m.lines
}

// ─── Klassifikation ────────────────────────────────────────────────────────
function classify(text) {
  const head = text.slice(0, 80)
  if (/FLEXIONES CPTLN-PY/i.test(head)) return 'cptln'
  if (/Para reflexionar/i.test(text)) return 'para-el-camino'
  return null
}

// ─── Parser: 5 Minutos Com Jesus / CPTLN ───────────────────────────────────
function parseCptln(msg) {
  const lines = msg.text.split('\n')
  lines.shift() // Kopfzeile "*REFLEXIONES CPTLN-PY*" (bzw. Tippfehler-Variante)
  while (lines.length && lines[0].trim() === '') lines.shift()
  if (lines.length && /^\d{1,2}\s+de\s+\S+\s+de\s+\d{4}/i.test(lines[0].trim())) lines.shift()
  while (lines.length && lines[0].trim() === '') lines.shift()
  const rest = lines.join('\n')

  const titleMatch = rest.match(/^\*([^*]+)\*/)
  const title = titleMatch ? titleMatch[1].trim() : null

  const lecturaMatch = rest.match(/\*Lectura:?\*[^\n]*?["“]([\s\S]*?)["”]_?\s*\(([^)]+)\)/)
  const quote = lecturaMatch ? lecturaMatch[1].replace(/^_+|_+$/g, '').trim() : null
  const reference = lecturaMatch ? lecturaMatch[2].trim() : null

  let body = null
  const bodyMatch = rest.match(/\*Lectura:?\*[\s\S]*?\)\s*\n+([\s\S]*?)\n+\*Oremos:?\*/)
  if (bodyMatch) body = bodyMatch[1].trim()

  const prayerMatch = rest.match(/\*Oremos:?\*\s*([\s\S]*?)\n+\*Autor:?\*/)
  const prayer = prayerMatch
    ? prayerMatch[1].replace(/^[\p{Extended_Pictographic}\s]+/u, '').trim()
    : null

  const authorMatch = rest.match(/\*Autor:?\*\s*_?\s*([^_\n]+)_?/)
  const author = authorMatch ? authorMatch[1].trim() : null

  return { title, quote, reference, body, prayer, reflectionQuestions: [], author }
}

// ─── Parser: Para el Camino ─────────────────────────────────────────────────
// Zwei beobachtete Format-Varianten (Titel mit/ohne *Sternchen*, Zitat mit/ohne
// Anführungszeichen) — deshalb Absatz-basiert statt mit einem starren Regex.
function parsePlan2(msg) {
  const paragraphs = msg.text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const title = paragraphs.length ? paragraphs[0].replace(/^\*+|\*+$/g, '').trim() : null

  // Zitat+Referenz: erstes "(Buch Kap:Vers ...)"-Muster in einem der ersten Absätze.
  // Nicht am Absatzende verankert, weil manche Absätze Zitat + erste Body-Sätze
  // per einfachem Zeilenumbruch (kein Leerabsatz) zusammenhalten.
  const REF_RE = /\(([^()]*\d+[:.]\d+[^()]*)\)\.?/
  let quote = null
  let reference = null
  let quoteParaIdx = -1
  let quoteTailText = '' // Resttext desselben Absatzes nach der Referenz (gehört zum Body)
  for (let i = 1; i < Math.min(paragraphs.length, 4); i++) {
    const m = paragraphs[i].match(REF_RE)
    if (m) {
      quote = paragraphs[i].slice(0, m.index).replace(/^[«"“'‘_]+|[»"”'’_.,;:]+$/g, '').trim()
      reference = m[1].trim()
      quoteParaIdx = i
      quoteTailText = paragraphs[i].slice(m.index + m[0].length).trim()
      break
    }
  }

  const oracionIdx = paragraphs.findIndex((p) => /^\*?Oraci[oó]n:?\*?/i.test(p))
  const reflIdx = paragraphs.findIndex((p) => /^Para reflexionar/i.test(p))

  const body =
    quoteParaIdx >= 0 && oracionIdx > quoteParaIdx
      ? [quoteTailText, ...paragraphs.slice(quoteParaIdx + 1, oracionIdx)].filter(Boolean).join('\n\n')
      : null

  const prayer =
    oracionIdx >= 0 ? paragraphs[oracionIdx].replace(/^\*?Oraci[oó]n:?\*?\s*/i, '').trim() : null

  let reflectionQuestions = []
  let author = null
  if (reflIdx >= 0) {
    const reflLines = paragraphs
      .slice(reflIdx)
      .join('\n')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const qLines = reflLines.slice(1) // erste Zeile ist "Para reflexionar" selbst
    author = qLines.length
      ? qLines[qLines.length - 1].replace(/^Autora?:\s*/i, '').trim()
      : null
    reflectionQuestions = qLines
      .slice(0, -1)
      .map((l) => l.replace(/^[•*\-]\s*/, '').trim())
      .filter(Boolean)
  }

  return { title, quote, reference, body, prayer, reflectionQuestions, author }
}

// ─── Hauptlogik ──────────────────────────────────────────────────────────────
const PLAN_META = {
  cptln: {
    planId: '5-minutos-con-jesus',
    source: '5 Minutos Com Jesus (Hora Luterana Brasil), traducido por CPTLN Paraguay',
    license: 'permission-granted',
  },
  'para-el-camino': {
    planId: 'para-el-camino',
    source: 'Para el Camino',
    license: 'permission-pending',
  },
}

const results = { cptln: [], 'para-el-camino': [] }
const issues = []

for (const msg of messages) {
  const kind = classify(msg.text)
  if (!kind) continue

  const parsed = kind === 'cptln' ? parseCptln(msg) : parsePlan2(msg)
  const meta = PLAN_META[kind]

  const entry = {
    id: `${meta.planId}-${msg.date}`,
    date: msg.date,
    planId: meta.planId,
    lang: 'es',
    title: parsed.title,
    reference: parsed.reference,
    quote: parsed.quote,
    body: parsed.body,
    prayer: parsed.prayer,
    reflectionQuestions: parsed.reflectionQuestions,
    author: parsed.author,
    source: meta.source,
    license: meta.license,
    public_domain: false,
    raw: msg.text,
  }

  const missing = ['title', 'body'].filter((f) => !entry[f])
  if (missing.length) issues.push({ id: entry.id, missing, date: msg.date })

  // Ein Tag versehentlich doppelt gepostet: Duplikat verwerfen (bei Abweichung warnen).
  const existing = results[kind].find((e) => e.id === entry.id)
  if (existing) {
    if (existing.raw !== entry.raw) {
      issues.push({ id: entry.id, missing: ['DIVERGING_DUPLICATE'], date: msg.date })
      console.warn(`  ⚠ Abweichendes Duplikat für ${entry.id} — beide Fassungen prüfen!`)
    }
    continue
  }

  results[kind].push(entry)
}

for (const kind of Object.keys(results)) {
  const meta = PLAN_META[kind]
  const outFile = join(OUT_DIR, `${meta.planId}.es.json`)
  writeFileSync(outFile, JSON.stringify(results[kind], null, 2) + '\n', 'utf8')
  console.log(`${meta.planId}: ${results[kind].length} Einträge → ${outFile}`)
}

writeFileSync(join(OUT_DIR, '_report.json'), JSON.stringify(issues, null, 2) + '\n', 'utf8')
console.log(`\n${issues.length} Einträge mit fehlenden Pflichtfeldern (title/body) — siehe _report.json`)
