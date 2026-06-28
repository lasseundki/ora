import type { LiturgicalColor } from '../church-year'

export interface ColorScheme {
  strip: string    // farbiger Streifen oben (3–4px)
  badge: string    // Saison-Badge (klein, oben)
  accent: string   // Rubriken-Farbe für Abschnittsüberschriften
  divider: string  // Ornament-Trennlinie zwischen Abschnitten
}

const schemes: Record<LiturgicalColor, ColorScheme> = {
  violet: {
    strip:   'bg-violet-800',
    badge:   'text-violet-700 border border-violet-300',
    accent:  'text-violet-800',
    divider: 'text-violet-300',
  },
  white: {
    strip:   'bg-amber-500',
    badge:   'text-amber-700 border border-amber-300',
    accent:  'text-amber-700',
    divider: 'text-amber-300',
  },
  green: {
    strip:   'bg-emerald-800',
    badge:   'text-emerald-700 border border-emerald-300',
    accent:  'text-emerald-800',
    divider: 'text-emerald-300',
  },
  red: {
    strip:   'bg-red-800',
    badge:   'text-red-700 border border-red-300',
    accent:  'text-red-800',
    divider: 'text-red-300',
  },
  black: {
    strip:   'bg-stone-900',
    badge:   'text-stone-600 border border-stone-400',
    accent:  'text-stone-700',
    divider: 'text-stone-400',
  },
}

export const SEASON_NAMES: Record<string, string> = {
  advent:     'Advent',
  weihnachten:'Weihnachten',
  epiphanias: 'Epiphanias',
  vorfasten:  'Vorfastenzeit',
  passion:    'Passionszeit',
  ostern:     'Osterzeit',
  pfingsten:  'Pfingsten',
  trinitatis: 'Trinitatiszeit',
}

export function getColors(color: LiturgicalColor): ColorScheme {
  return schemes[color]
}
