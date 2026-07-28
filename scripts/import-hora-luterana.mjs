// Holt ein vollständiges Jahr (365 Tage, rückwärts ab heute) von "5 Minutos Com Jesus"
// direkt von der Originalquelle horaluterana.org.br (Hora Luterana Brasil, portugiesisches
// Original). Ergänzt/ersetzt NICHT automatisch die spanische CPTLN-Fassung aus dem WhatsApp-
// Import — beide bleiben als separate Sprachfassungen desselben planId erhalten.
//
// Nutzungsrecht: NICHT geklärt (Stand 2026-07-20) — "© Hora Luterana", eigenständiger
// Rechteinhaber, separat von CPTLN Paraguay. Nur vorläufiger Import für die unveröffentlichte
// App, siehe scripts/Lizenzierte-Quellen.md. Vor Launch: Erlaubnis einholen (z.B. über LHM
// zentral, camino@lhm.org) oder wieder entfernen.
//
// Höflichkeits-Pause zwischen Requests, um den Server nicht zu belasten.
//
// Aufruf: node scripts/import-hora-luterana.mjs

import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dir, 'source', 'cptln-import')
mkdirSync(OUT_DIR, { recursive: true })

const BASE = 'https://www.horaluterana.org.br/mensagens-de-audio/5-minutos-com-jesus/'
const UA =
  'Mozilla/5.0 (compatible; OraDevotionalAppBot/1.0; non-commercial, unpublished app, seeking permission; contact via mision.cptln@gmail.com network)'
const CUTOFF_DAYS = 365

const MONTHS = {
  janeiro: 1, fevereiro: 2, março: 3, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
}

function parsePtDate(s) {
  // \w matcht kein "ç" (março) — Unicode-Buchstabenklasse statt \w verwenden.
  const m = s.match(/(\d{1,2})\s+de\s+([\p{L}]+)\s+de\s+(\d{4})/iu)
  if (!m) return null
  const day = m[1].padStart(2, '0')
  const month = String(MONTHS[m[2].toLowerCase()] ?? '').padStart(2, '0')
  if (month === '00') return null
  return `${m[3]}-${month}-${day}`
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// Mit Retry + Mindestgrößen-Prüfung: die Seite hat gelegentlich verstümmelte
// 200-OK-Antworten geliefert (Bytegröße normal >60 KB), die sonst stillschweigend
// als "leere Seite" durchgegangen wären.
async function fetchText(url, { minBytes = 5000, retries = 3 } = {}) {
  let lastErr
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (!res.ok) throw new Error(`HTTP ${res.status} bei ${url}`)
      const text = await res.text()
      if (text.length < minBytes) throw new Error(`Verdächtig kleine Antwort (${text.length} Bytes) bei ${url}`)
      return text
    } catch (e) {
      lastErr = e
      if (attempt < retries) await sleep(800 * attempt)
    }
  }
  throw lastErr
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

// ─── Phase 1: Index sammeln, bis das Jahresfenster abgedeckt ist ──────────────
const today = new Date()
const cutoffDate = new Date(today.getTime() - CUTOFF_DAYS * 86400000)
const cutoffIso = cutoffDate.toISOString().slice(0, 10)

const index = []
let page = 1
console.log(`Sammle Index bis Datum >= ${cutoffIso} …`)
while (true) {
  const url = page === 1 ? BASE : `${BASE}page/${page}/`

  // Seiten liefern gelegentlich (vermutlich Bot-Throttling) deutlich weniger als die
  // üblichen 24 Einträge zurück, trotz normaler Bytegröße. Bei Verdacht erneut abrufen.
  let pageEntries = []
  for (let attempt = 1; attempt <= 4; attempt++) {
    const html = await fetchText(url)
    const entryRe =
      /<div class="sermon-date">Publicado em: ([^<]+)<\/div>\s*<a href="(https:\/\/www\.horaluterana\.org\.br\/mensagem\/[^"]+)">([^<]+)<\/a>/g
    let m
    pageEntries = []
    while ((m = entryRe.exec(html))) {
      const date = parsePtDate(m[1])
      if (!date) continue
      pageEntries.push({ date, url: m[2], title: m[3].trim() })
    }
    if (pageEntries.length >= 20 || pageEntries.length === 0) break // 0 = plausibel letzte Seite
    console.log(`  Seite ${page}: nur ${pageEntries.length} Einträge, Versuch ${attempt}/4 — erneut …`)
    await sleep(1500 * attempt)
  }

  for (const e of pageEntries) index.push(e)
  const found = pageEntries.length
  console.log(`  Seite ${page}: ${found} Einträge`)
  if (found === 0) break
  const oldestOnPage = index[index.length - 1].date
  if (oldestOnPage < cutoffIso) break
  page++
  await sleep(300)
}

writeFileSync(join(OUT_DIR, 'hora-luterana-index.json'), JSON.stringify(index, null, 2) + '\n', 'utf8')
const yearIndex = index.filter((e) => e.date >= cutoffIso)
console.log(`Index gesamt: ${index.length}, im Jahresfenster: ${yearIndex.length}`)

// ─── Phase 2: Volltext je Eintrag ──────────────────────────────────────────────
const entries = []
const failures = []
let i = 0
// Zwei Vorlagen im Umlauf: "Referência:"/"Versículo:" mit <strong>, oder
// älter "Texto:" + unbeschriftetes <em>-Zitat mit <b>. Deshalb absatzbasiert
// statt mit starren Feld-Regexen (robuster gegen Formatwechsel).
function parseContentParagraphs(contentHtml) {
  const pBlocks = contentHtml.match(/<p>[\s\S]*?<\/p>/g) || []
  let reference = null
  let quote = null
  let prayer = null
  const bodyParts = []

  for (const raw of pBlocks) {
    const inner = raw.replace(/^<p>/, '').replace(/<\/p>$/, '')

    if (/^<(?:b|strong)>\s*Para:\s*<\/(?:b|strong)>/i.test(inner)) continue // Datums-Wiederholung

    const refLabel = inner.match(/^<(?:b|strong)>\s*(?:Texto|Refer[eê]ncia):\s*<\/(?:b|strong)>\s*(.*)$/i)
    if (refLabel && !reference) {
      reference = stripHtml(refLabel[1])
      continue
    }

    const verseLabel = inner.match(/^<strong>\s*Vers[ií]culo:\s*<\/strong>\s*(.*)$/i)
    if (verseLabel && !quote) {
      const t = stripHtml(verseLabel[1])
      const m = t.match(/^[«“"]?([\s\S]*?)[»”"]?\s*\(([^()]+)\)\.?$/)
      quote = m ? m[1].trim() : t
      if (m && !reference) reference = m[2].trim()
      continue
    }

    const prayerLabel = inner.match(/^<(?:b|strong)>\s*Oremos:\s*<\/(?:b|strong)>\s*(.*)$/i)
    if (prayerLabel) {
      prayer = stripHtml(prayerLabel[1])
      continue
    }

    // Unbeschriftetes Zitat: ganzer Absatz in <em>, direkt nach der Referenz
    if (!quote && reference && /^<em>[\s\S]*<\/em>$/i.test(inner)) {
      const t = stripHtml(inner)
      const m = t.match(/^[«“"]?([\s\S]*?)[»”"]?\s*\(([^()]+)\)\.?$/)
      quote = m ? m[1].trim() : t
      continue
    }

    const text = stripHtml(inner)
    if (text) bodyParts.push(text)
  }

  return { reference, quote, body: bodyParts.join('\n\n'), prayer }
}

for (const item of yearIndex) {
  i++
  if (i % 20 === 0 || i === yearIndex.length) console.log(`  ${i}/${yearIndex.length} …`)
  try {
    const html = await fetchText(item.url)

    const contentBlockMatch = html.match(
      /<div class="single-post-content[^>]*>([\s\S]*?)<\/div>\s*(?:<!--|<div class="single-post-author)/i,
    )
    const authorMatch = html.match(/<div class="single-post-author">[\s\S]*?<h3>([^<]+)<\/h3>/i)

    const parsed = parseContentParagraphs(contentBlockMatch ? contentBlockMatch[1] : '')

    entries.push({
      id: `5-minutos-con-jesus-pt-${item.date}`,
      date: item.date,
      planId: '5-minutos-con-jesus',
      lang: 'pt',
      title: item.title,
      reference: parsed.reference,
      quote: parsed.quote,
      body: parsed.body,
      prayer: parsed.prayer,
      author: authorMatch ? authorMatch[1].trim() : null,
      source: '5 Minutos Com Jesus (Hora Luterana Brasil)',
      license: 'permission-pending',
      public_domain: false,
      url: item.url,
    })
  } catch (e) {
    failures.push({ ...item, error: String(e) })
  }
  await sleep(250)
}

writeFileSync(
  join(OUT_DIR, '5-minutos-con-jesus.pt.json'),
  JSON.stringify(entries, null, 2) + '\n',
  'utf8',
)
writeFileSync(
  join(OUT_DIR, 'hora-luterana-failures.json'),
  JSON.stringify(failures, null, 2) + '\n',
  'utf8',
)
console.log(`\nFertig: ${entries.length} Einträge, ${failures.length} Fehler.`)
