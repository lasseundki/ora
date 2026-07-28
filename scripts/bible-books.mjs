// Buchnamen-Tabelle: Portugiesisch/Spanisch (voll + Kurzform) → OSIS-Code (wie in
// verse-index.json) → deutsche Kurzform (Luther-Konvention, passend zu bestehenden
// Ora-Inhalten, z.B. "Lk 16,19-31", "1Joh 4,16-21", "Ps 32").
export const BOOKS = [
  { osis: 'Gen',    pt: ['Gênesis', 'Genesis'],                 es: ['Génesis', 'Genesis', 'Gn'],           de: '1. Mose' },
  { osis: 'Exod',   pt: ['Êxodo', 'Exodo', 'Ex'],                es: ['Éxodo', 'Exodo', 'Ex'],                de: '2. Mose' },
  { osis: 'Lev',    pt: ['Levítico', 'Lv'],                      es: ['Levítico', 'Lv'],                      de: '3. Mose' },
  { osis: 'Num',    pt: ['Números', 'Nm'],                       es: ['Números', 'Nm'],                       de: '4. Mose' },
  { osis: 'Deut',   pt: ['Deuteronômio', 'Dt'],                  es: ['Deuteronomio', 'Dt'],                  de: '5. Mose' },
  { osis: 'Josh',   pt: ['Josué', 'Js'],                         es: ['Josué', 'Jos'],                        de: 'Jos' },
  { osis: 'Judg',   pt: ['Juízes', 'Jz'],                        es: ['Jueces', 'Jue'],                       de: 'Ri' },
  { osis: 'Ruth',   pt: ['Rute', 'Rt'],                          es: ['Rut', 'Rt'],                           de: 'Rut' },
  { osis: '1Sam',   pt: ['1 Samuel', '1Samuel', '1Sm'],          es: ['1 Samuel', '1Samuel', '1S'],           de: '1. Samuel' },
  { osis: '2Sam',   pt: ['2 Samuel', '2Samuel', '2Sm'],          es: ['2 Samuel', '2Samuel', '2S'],           de: '2. Samuel' },
  { osis: '1Kgs',   pt: ['1 Reis', '1Reis', '1Rs'],              es: ['1 Reyes', '1Reyes', '1R'],             de: '1. Könige' },
  { osis: '2Kgs',   pt: ['2 Reis', '2Reis', '2Rs'],              es: ['2 Reyes', '2Reyes', '2R'],             de: '2. Könige' },
  { osis: '1Chr',   pt: ['1 Crônicas', '1Crônicas', '1Cr'],      es: ['1 Crónicas', '1Crónicas', '1Cr'],      de: '1. Chronik' },
  { osis: '2Chr',   pt: ['2 Crônicas', '2Crônicas', '2Cr'],      es: ['2 Crónicas', '2Crónicas', '2Cr'],      de: '2. Chronik' },
  { osis: 'Ezra',   pt: ['Esdras', 'Ed'],                        es: ['Esdras', 'Esd'],                       de: 'Esra' },
  { osis: 'Neh',    pt: ['Neemias', 'Ne'],                       es: ['Nehemías', 'Nehemias', 'Neh'],         de: 'Nehemia' },
  { osis: 'Esth',   pt: ['Ester', 'Et'],                         es: ['Ester', 'Est'],                        de: 'Ester' },
  { osis: 'Job',    pt: ['Jó'],                                   es: ['Job'],                                  de: 'Hiob' },
  { osis: 'Ps',     pt: ['Salmos', 'Salmo', 'Sl'],                es: ['Salmos', 'Salmo', 'Sal'],               de: 'Ps' },
  { osis: 'Prov',   pt: ['Provérbios', 'Pv'],                    es: ['Proverbios', 'Prov'],                  de: 'Spr' },
  { osis: 'Eccl',   pt: ['Eclesiastes', 'Ec'],                   es: ['Eclesiastés', 'Eclesiastes', 'Ecl'],   de: 'Pred' },
  { osis: 'Song',   pt: ['Cantares', 'Cântico dos Cânticos', 'Ct'], es: ['Cantares', 'Cnt'],                  de: 'Hld' },
  { osis: 'Isa',    pt: ['Isaías', 'Is'],                        es: ['Isaías', 'Isaias', 'Is'],              de: 'Jes' },
  { osis: 'Jer',    pt: ['Jeremias', 'Jr'],                      es: ['Jeremías', 'Jeremias', 'Jer'],         de: 'Jer' },
  { osis: 'Lam',    pt: ['Lamentações', 'Lm'],                   es: ['Lamentaciones', 'Lam'],                de: 'Klgl' },
  { osis: 'Ezek',   pt: ['Ezequiel', 'Ez'],                      es: ['Ezequiel', 'Ez'],                      de: 'Hes' },
  { osis: 'Dan',    pt: ['Daniel', 'Dn'],                        es: ['Daniel', 'Dan'],                       de: 'Dan' },
  { osis: 'Hos',    pt: ['Oséias', 'Oseias', 'Os'],              es: ['Oseas', 'Os'],                         de: 'Hos' },
  { osis: 'Joel',   pt: ['Joel', 'Jl'],                          es: ['Joel'],                                 de: 'Joel' },
  { osis: 'Amos',   pt: ['Amós', 'Am'],                          es: ['Amós', 'Amos', 'Am'],                  de: 'Am' },
  { osis: 'Obad',   pt: ['Obadias', 'Ob'],                       es: ['Abdías', 'Abdias', 'Abd'],             de: 'Obd' },
  { osis: 'Jonah',  pt: ['Jonas', 'Jn'],                         es: ['Jonás', 'Jonas', 'Jon'],               de: 'Jona' },
  { osis: 'Mic',    pt: ['Miquéias', 'Miqueias', 'Mq'],          es: ['Miqueas', 'Miq'],                      de: 'Mi' },
  { osis: 'Nah',    pt: ['Naum', 'Na'],                          es: ['Nahúm', 'Nahum', 'Nah'],               de: 'Nah' },
  { osis: 'Hab',    pt: ['Habacuque', 'Hc'],                     es: ['Habacuc', 'Hab'],                      de: 'Hab' },
  { osis: 'Zeph',   pt: ['Sofonias', 'Sf'],                      es: ['Sofonías', 'Sofonias', 'Sof'],         de: 'Zef' },
  { osis: 'Hag',    pt: ['Ageu', 'Ag'],                          es: ['Hageo', 'Hag'],                        de: 'Hag' },
  { osis: 'Zech',   pt: ['Zacarias', 'Zc'],                      es: ['Zacarías', 'Zacarias', 'Zac'],         de: 'Sach' },
  { osis: 'Mal',    pt: ['Malaquias', 'Ml'],                     es: ['Malaquías', 'Malaquias', 'Mal'],       de: 'Mal' },

  { osis: 'Matt',    pt: ['Mateus', 'Mt'],                        es: ['Mateo', 'Mt'],                         de: 'Mt' },
  { osis: 'Mark',    pt: ['Marcos', 'Mc'],                        es: ['Marcos', 'Mr', 'Mc'],                  de: 'Mk' },
  { osis: 'Luke',    pt: ['Lucas', 'Lc'],                         es: ['Lucas', 'Lc'],                         de: 'Lk' },
  { osis: 'John',    pt: ['João', 'Joao', 'Jo'],                  es: ['Juan', 'Jn'],                          de: 'Joh' },
  { osis: 'Acts',    pt: ['Atos', 'At'],                          es: ['Hechos', 'Hch'],                       de: 'Apg' },
  { osis: 'Rom',     pt: ['Romanos', 'Rm'],                       es: ['Romanos', 'Ro', 'Rom'],                de: 'Röm' },
  { osis: '1Cor',    pt: ['1 Coríntios', '1Coríntios', '1Co'],    es: ['1 Corintios', '1Corintios', '1Co'],    de: '1. Korinther' },
  { osis: '2Cor',    pt: ['2 Coríntios', '2Coríntios', '2Co'],    es: ['2 Corintios', '2Corintios', '2Co'],    de: '2. Korinther' },
  { osis: 'Gal',     pt: ['Gálatas', 'Gl'],                       es: ['Gálatas', 'Galatas', 'Gá', 'Gal'],     de: 'Gal' },
  { osis: 'Eph',     pt: ['Efésios', 'Ef'],                       es: ['Efesios', 'Ef'],                       de: 'Eph' },
  { osis: 'Phil',    pt: ['Filipenses', 'Fp'],                    es: ['Filipenses', 'Fil', 'Flp'],            de: 'Phil' },
  { osis: 'Col',     pt: ['Colossenses', 'Colossences', 'Cl'],    es: ['Colosenses', 'Col'],                   de: 'Kol' },
  { osis: '1Thess',  pt: ['1 Tessalonicenses', '1Tessalonicenses', '1Ts'], es: ['1 Tesalonicenses', '1Tesalonicenses', '1Ts'], de: '1. Thessalonicher' },
  { osis: '2Thess',  pt: ['2 Tessalonicenses', '2Tessalonicenses', '2Ts'], es: ['2 Tesalonicenses', '2Tesalonicenses', '2Ts'], de: '2. Thessalonicher' },
  { osis: '1Tim',    pt: ['1 Timóteo', '1Timóteo', '1Tm'],        es: ['1 Timoteo', '1Timoteo', '1Ti'],        de: '1. Timotheus' },
  { osis: '2Tim',    pt: ['2 Timóteo', '2Timóteo', '2Tm'],        es: ['2 Timoteo', '2Timoteo', '2Ti'],        de: '2. Timotheus' },
  { osis: 'Titus',   pt: ['Tito', 'Tt'],                          es: ['Tito', 'Tit'],                         de: 'Tit' },
  { osis: 'Phlm',    pt: ['Filemom', 'Fm'],                       es: ['Filemón', 'Filemon', 'Flm'],           de: 'Phlm' },
  { osis: 'Heb',     pt: ['Hebreus', 'Hb'],                       es: ['Hebreos', 'Heb'],                      de: 'Hebr' },
  { osis: 'Jas',     pt: ['Tiago', 'Tg'],                         es: ['Santiago', 'Stg', 'Sant'],             de: 'Jak' },
  { osis: '1Pet',    pt: ['1 Pedro', '1Pedro', '1Pe'],            es: ['1 Pedro', '1Pedro', '1P'],             de: '1. Petrus' },
  { osis: '2Pet',    pt: ['2 Pedro', '2Pedro', '2Pe'],            es: ['2 Pedro', '2Pedro', '2P'],             de: '2. Petrus' },
  { osis: '1John',   pt: ['1 João', '1João', '1Joao', '1Jo'],     es: ['1 Juan', '1Juan', '1Jn'],              de: '1. Johannes' },
  { osis: '2John',   pt: ['2 João', '2João', '2Joao', '2Jo'],     es: ['2 Juan', '2Juan', '2Jn'],              de: '2. Johannes' },
  { osis: '3John',   pt: ['3 João', '3João', '3Joao', '3Jo'],     es: ['3 Juan', '3Juan', '3Jn'],              de: '3. Johannes' },
  { osis: 'Jude',    pt: ['Judas', 'Jd'],                         es: ['Judas', 'Jud'],                        de: 'Jud' },
  { osis: 'Rev',     pt: ['Apocalipse', 'Ap'],                    es: ['Apocalipsis', 'Ap'],                   de: 'Offb' },
]

// Nachschlagetabellen aufbauen (längste Namen zuerst prüfen, um Teilstring-Kollisionen
// zu vermeiden, z.B. "1 João" vor "João").
function buildLookup(lang) {
  const pairs = []
  for (const b of BOOKS) {
    for (const name of b[lang]) pairs.push([name, b])
  }
  pairs.sort((a, b) => b[0].length - a[0].length)
  return pairs
}

const PT_LOOKUP = buildLookup('pt')
const ES_LOOKUP = buildLookup('es')

function normalize(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function findBook(nameRaw, lang) {
  const lookup = lang === 'pt' ? PT_LOOKUP : ES_LOOKUP
  const n = normalize(nameRaw)
  for (const [name, book] of lookup) {
    if (normalize(name) === n) return book
  }
  // Präfix-Fallback (z.B. "1 Coríntios" vs. Referenztext mit Punkt/Leerzeichen-Varianten)
  for (const [name, book] of lookup) {
    if (n.startsWith(normalize(name)) || normalize(name).startsWith(n)) return book
  }
  return null
}

export function deBookName(osis) {
  return BOOKS.find((b) => b.osis === osis)?.de ?? osis
}
