import { describe, it, expect } from 'vitest'
import { easterDate, liturgicalDay } from './index'

describe('easterDate', () => {
  const cases: [number, string][] = [
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2030, '2030-04-21'],
  ]
  it.each(cases)('Ostern %i = %s', (year, expected) => {
    expect(easterDate(year).toISOString().slice(0, 10)).toBe(expected)
  })
})

describe('liturgicalDay', () => {
  const cases: [string, string, string][] = [
    ['2026-04-05', 'Ostersonntag',                          'ostern'],
    ['2025-04-20', 'Ostersonntag',                          'ostern'],
    ['2024-03-31', 'Ostersonntag',                          'ostern'],
    ['2026-11-29', '1. Sonntag im Advent',                  'advent'],
    ['2026-12-25', 'Christfest (1. Weihnachtstag)',          'weihnachten'],
    ['2026-01-06', 'Epiphanias',                             'epiphanias'],
    ['2026-05-31', 'Trinitatis',                             'trinitatis'],
    ['2026-06-25', 'Woche nach 3. Sonntag nach Trinitatis', 'trinitatis'],
    ['2026-02-18', 'Aschermittwoch',                         'passion'],
    ['2026-03-29', 'Palmarum (Palmsonntag)',                 'passion'],
    ['2026-04-02', 'Gründonnerstag',                         'passion'],
    ['2026-04-03', 'Karfreitag',                             'passion'],
  ]
  it.each(cases)('%s → %s (%s)', (ds, name, season) => {
    const r = liturgicalDay(new Date(`${ds}T12:00:00Z`))
    expect(r).not.toBeNull()
    expect(r!.name).toBe(name)
    expect(r!.season).toBe(season)
  })
})
