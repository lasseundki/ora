// Content-Typ für kalendertäglich fortlaufende Andachtsreihen ("Pläne"), die
// unabhängig vom liturgischen Kirchenjahr laufen — siehe scripts/Lizenzierte-Quellen.md
// und scripts/import-cptln-chat.mjs. Ergänzt DayContent (church-year-basiert), ersetzt es nicht.

export interface PlanEntry {
  id: string // `${planId}-${date}`, z.B. "5-minutos-con-jesus-2025-09-18"
  date: string // ISO-Datum, YYYY-MM-DD
  planId: string
  lang: string
  title: string
  reference?: string
  quote?: string
  body: string
  prayer?: string
  reflectionQuestions?: string[]
  author?: string
  source: string
  license: 'public-domain' | 'permission-granted' | 'permission-pending'
  public_domain: boolean
}

export interface PlanMeta {
  id: string
  title: string
  description?: string
  source: string
  license: PlanEntry['license']
}
