// Leichtgewichtige Inhalt-Validierung ohne externe Abhängigkeiten.
// Prüft Pflichtfelder, erlaubte Enum-Werte und Provenance/Public-Domain-Pflicht.
// Aufruf: node scripts/validate.mjs
import { readFileSync, readdirSync } from 'node:fs'

const SEASONS = ['advent','weihnachten','epiphanias','vorfasten','passion','ostern','pfingsten','trinitatis']
const COLORS  = ['violet','white','green','red','black']
const RANKS   = ['fest','sonntag','wochentag']

const errs = []
const check = (cond, msg) => { if (!cond) errs.push(msg) }

const contentDir = new URL('../public/content/de', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const files = readdirSync(contentDir).filter(f => f.endsWith('.json'))

if (files.length === 0) {
  console.log('Keine JSON-Dateien in content/de gefunden.')
  process.exit(0)
}

for (const f of files) {
  const d = JSON.parse(readFileSync(`${contentDir}/${f}`, 'utf8'))
  const p = (m) => `${f}: ${m}`

  for (const k of ['id','name','season','color','rank','readings','lang'])
    check(d[k] != null, p(`Pflichtfeld fehlt: ${k}`))

  check(SEASONS.includes(d.season), p(`season ungültig: ${d.season}`))
  check(COLORS.includes(d.color),   p(`color ungültig: ${d.color}`))
  check(RANKS.includes(d.rank),     p(`rank ungültig: ${d.rank}`))
  check(d.readings?.gospel?.ref,    p('readings.gospel.ref fehlt'))

  for (const seg of ['devotion','collect']) {
    if (!d[seg]) continue
    check(d[seg].text   != null,      p(`${seg}.text fehlt`))
    check(d[seg].public_domain === true, p(`${seg}.public_domain muss true sein (MVP)`))
    check(d[seg].source != null,      p(`${seg}.source (Provenance) fehlt`))
  }

  if (d.hymn) {
    check(d.hymn.public_domain === true, p('hymn.public_domain muss true sein'))
    check(d.hymn.source != null,         p('hymn.source fehlt'))
  }
}

if (errs.length) {
  console.error('FEHLER:')
  errs.forEach(e => console.error('  - ' + e))
  process.exit(1)
}
console.log(`${files.length} Inhaltsdatei(en) gültig — Pflichtfelder, Provenance, Public-Domain OK.`)
