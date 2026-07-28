// Holt ein vollständiges Jahr (365 Tage, rückwärts ab heute) der spanischen
// "Devociones"-Reihe (Marke "Para el Camino" / "Alimento Diario") direkt von der
// offiziellen Quelle paraelcamino.com, per RSS-Feed-Paginierung (?paged=N).
// Dieselbe Ministry-Familie wie CPTLN Paraguay (Fußzeile: "© Copyright Cristo Para
// Todas Las Naciones"), Herausgeber laut Impressum: Lutheran Hour Ministries (LHM).
//
// Nutzungsrecht: für "Para el Camino" noch ausstehend (siehe scripts/Lizenzierte-Quellen.md).
// Nur vorläufiger Import für die unveröffentlichte App.
//
// Aufruf: node scripts/import-alimento-diario.mjs

import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dir, 'source', 'cptln-import')
mkdirSync(OUT_DIR, { recursive: true })

const FEED = 'https://www.paraelcamino.com/alimentodiario/feed/'
const UA =
  'Mozilla/5.0 (compatible; OraDevotionalAppBot/1.0; non-commercial, unpublished app, seeking permission)'
const CUTOFF_DAYS = 365

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} bei ${url}`)
  return res.text()
}

function stripHtml(s) {
  return s
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

// RSS <item>-Block grob extrahieren
const ITEM_RE = /<item>([\s\S]*?)<\/item>/g

function parseItem(itemXml) {
  const title = (itemXml.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1].trim()
  const link = (itemXml.match(/<link>([\s\S]*?)<\/link>/) || [, ''])[1].trim()
  const pubDate = (itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [, ''])[1].trim()
  const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)
  const descHtml = descMatch ? descMatch[1] : ''

  const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : null

  // Audio-Player am Anfang entfernen
  let html = descHtml.replace(/^<audio[\s\S]*?<\/audio>\s*(?:<br\s*\/?>\s*)*/i, '')

  // Copyright-Fußzeile + alles danach (Bild etc.) entfernen
  html = html.split(/<hr\s*\/?>/i)[0]

  // WICHTIG: nicht per "erstes <em>/<i> irgendwo im HTML" suchen (das trifft oft eine
  // beiläufige Betonung MITTEN im Fließtext, nicht Gebet/Autor) — stattdessen per
  // POSITION arbeiten: Gebet = Absatz vor "Para reflexionar" bzw. vorletzter Absatz;
  // Autor = letzter Absatz (Byline steht laut Quelle immer zuletzt).
  const paragraphs = html
    .split(/<br\s*\/?>\s*<br\s*\/?>|\n\s*\n/i)
    .map((p) => stripHtml(p))
    .filter(Boolean)

  // Zitat+Referenz: erstes "(Buch Kap:Vers)"-Muster in den ersten Absätzen
  const REF_RE = /\(([^()]*\d+[:.]\d+[^()]*)\)\.?/
  let quote = null, reference = null, quoteParaIdx = -1, quoteTailText = ''
  for (let i = 0; i < Math.min(paragraphs.length, 4); i++) {
    const m = paragraphs[i].match(REF_RE)
    if (m) {
      quote = paragraphs[i].slice(0, m.index).replace(/^[«"“'‘_]+|[»"”'’_.,;:]+$/g, '').trim()
      reference = m[1].trim()
      quoteParaIdx = i
      quoteTailText = paragraphs[i].slice(m.index + m[0].length).trim()
      break
    }
  }

  const lastIdx = paragraphs.length - 1
  const reflIdx = paragraphs.findIndex((p) => /^Para reflexionar/i.test(p))

  // Autor: letzter Absatz (Byline)
  const author = lastIdx >= 0 ? paragraphs[lastIdx] : null

  // Gebet: Absatz direkt vor "Para reflexionar", sonst vorletzter Absatz (vor der Byline)
  let prayerIdx = -1
  if (reflIdx > 0) prayerIdx = reflIdx - 1
  else if (lastIdx > 0) prayerIdx = lastIdx - 1
  const prayer = prayerIdx >= 0 && prayerIdx > quoteParaIdx ? paragraphs[prayerIdx] : null

  const endBodyIdx = prayer !== null ? prayerIdx : reflIdx >= 0 ? reflIdx : lastIdx + 1

  const body =
    quoteParaIdx >= 0
      ? [quoteTailText, ...paragraphs.slice(quoteParaIdx + 1, endBodyIdx)].filter(Boolean).join('\n\n')
      : paragraphs.slice(0, endBodyIdx).join('\n\n')

  // Reflexionsfragen: meist INNERHALB desselben Absatzes wie "Para reflexionar" (per
  // einfachem Zeilenumbruch getrennt, nicht als eigener Absatz) — plus, falls doch als
  // eigene Absätze vorhanden, alles bis zur Byline (letzter Absatz ausgenommen).
  let reflectionQuestions = []
  if (reflIdx >= 0) {
    const linesInReflPara = paragraphs[reflIdx].split('\n').slice(1) // "Para reflexionar" selbst weg
    const followingParas = paragraphs.slice(reflIdx + 1, lastIdx >= 0 ? lastIdx : undefined)
    reflectionQuestions = [...linesInReflPara, ...followingParas.join('\n').split('\n')]
      .map((l) => l.replace(/^[•*\-]\s*/, '').trim())
      .filter(Boolean)
  }

  const raw = paragraphs.join('\n\n')
  return { title, link, date, quote, reference, body, prayer, reflectionQuestions, author, raw }
}

// ─── Hauptlogik: RSS-Seiten rückwärts paginieren ──────────────────────────────
const today = new Date()
const cutoffDate = new Date(today.getTime() - CUTOFF_DAYS * 86400000)
const cutoffIso = cutoffDate.toISOString().slice(0, 10)

const entries = []
let page = 1
console.log(`Sammle "Alimento Diario" bis Datum >= ${cutoffIso} …`)
while (true) {
  const url = page === 1 ? FEED : `${FEED}?paged=${page}`
  let xml
  try {
    xml = await fetchText(url)
  } catch (e) {
    console.log(`  Seite ${page}: Fehler (${e.message}) — Ende.`)
    break
  }
  const items = [...xml.matchAll(ITEM_RE)].map((m) => parseItem(m[1]))
  if (!items.length) {
    console.log(`  Seite ${page}: keine Einträge mehr — Ende.`)
    break
  }
  console.log(`  Seite ${page}: ${items.length} Einträge (${items[0].date} … ${items[items.length - 1].date})`)

  for (const it of items) {
    if (!it.date) continue
    entries.push({
      id: `para-el-camino-es-${it.date}-${entries.length}`,
      date: it.date,
      planId: 'para-el-camino',
      lang: 'es',
      title: it.title,
      reference: it.reference,
      quote: it.quote,
      body: it.body,
      prayer: it.prayer,
      reflectionQuestions: it.reflectionQuestions,
      author: it.author,
      source: 'Para el Camino / Alimento Diario (paraelcamino.com, Lutheran Hour Ministries)',
      license: 'permission-pending',
      public_domain: false,
      url: it.link,
      raw: it.raw,
    })
  }

  const oldestOnPage = items[items.length - 1].date
  if (oldestOnPage && oldestOnPage < cutoffIso) break
  page++
  await sleep(300)
}

const yearEntries = entries.filter((e) => e.date >= cutoffIso)
writeFileSync(
  join(OUT_DIR, 'para-el-camino.es.full.json'),
  JSON.stringify(yearEntries, null, 2) + '\n',
  'utf8',
)
console.log(`\nFertig: ${yearEntries.length} Einträge im Jahresfenster → para-el-camino.es.full.json`)

const missing = yearEntries.filter((e) => !e.title || !e.body)
if (missing.length) {
  writeFileSync(join(OUT_DIR, 'alimento-diario-report.json'), JSON.stringify(missing, null, 2) + '\n', 'utf8')
  console.log(`${missing.length} Einträge mit fehlenden Pflichtfeldern — siehe alimento-diario-report.json`)
}
