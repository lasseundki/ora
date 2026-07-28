import type { Provenance } from './content'

export interface LiturgyText extends Partial<Provenance> {
  content: string
}

export interface LiturgyPart {
  id: string
  order: number
  name: string
  /** Kurzbeschreibung für die Übersicht */
  summary: string
  /** Ausführliche Erklärung (redaktioneller Text, keine Quellenangabe im Sinn von Provenance) */
  explanation: string
  /** Optionaler, wörtlich zitierter traditioneller Text mit Provenance */
  text?: LiturgyText
}
