export interface Provenance {
  source: string
  author?: string
  year?: number
  license?: string
  public_domain: boolean
  cycle_year?: number
}

export interface Reading extends Partial<Provenance> {
  ref: string
  text?: string
  stable?: boolean
}

export interface Readings {
  gospel: Reading
  epistle?: Reading
  ot?: Reading
  psalm?: Reading
}

export interface TextBlock extends Provenance {
  text: string
}

export interface Hymn extends Provenance {
  title: string
  stanzas?: string[]
}

export interface CatechismSegment {
  part: string
  text: string
}

export interface DayContent {
  id: string
  name: string
  season: string
  color: string
  rank: string
  lang: string
  readings: Readings
  devotion?: TextBlock
  hymn?: Hymn
  collect?: TextBlock
  catechism_segment?: CatechismSegment
}
