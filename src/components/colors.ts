import type { LiturgicalColor } from '../church-year'

export interface ColorScheme {
  strip: string       // farbiger Streifen oben
  badge: string       // Saison-Badge
  sectionBorder: string
  accent: string      // Überschriften-Akzent
  page: string        // Seitenhintergrund
}

const schemes: Record<LiturgicalColor, ColorScheme> = {
  violet: {
    strip:         'bg-violet-700',
    badge:         'bg-violet-100 text-violet-800 border border-violet-300',
    sectionBorder: 'border-violet-200',
    accent:        'text-violet-800',
    page:          'bg-violet-50',
  },
  white: {
    strip:         'bg-amber-300',
    badge:         'bg-amber-100 text-amber-800 border border-amber-300',
    sectionBorder: 'border-amber-200',
    accent:        'text-amber-800',
    page:          'bg-amber-50',
  },
  green: {
    strip:         'bg-emerald-700',
    badge:         'bg-emerald-100 text-emerald-800 border border-emerald-300',
    sectionBorder: 'border-emerald-200',
    accent:        'text-emerald-800',
    page:          'bg-emerald-50',
  },
  red: {
    strip:         'bg-red-700',
    badge:         'bg-red-100 text-red-800 border border-red-300',
    sectionBorder: 'border-red-200',
    accent:        'text-red-800',
    page:          'bg-red-50',
  },
  black: {
    strip:         'bg-gray-900',
    badge:         'bg-gray-800 text-gray-200 border border-gray-600',
    sectionBorder: 'border-gray-700',
    accent:        'text-gray-200',
    page:          'bg-gray-950',
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
