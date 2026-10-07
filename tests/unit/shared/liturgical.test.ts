/**
 * Testy liturgical - data Wielkanocy
 */

import { describe, it, expect } from 'vitest'
import { getEasterDate, isEaster } from '@/shared/lib/liturgical'

describe('getEasterDate', () => {
  it.each([
    [2024, 3, 31],
    [2025, 4, 20],
    [2026, 4, 5],
    [2027, 3, 28],
    [2038, 4, 25], // najpóźniejsza możliwa data
    [2285, 3, 22], // najwcześniejsza możliwa data
  ])('Wielkanoc %i to %i/%i', (year, month, day) => {
    expect(getEasterDate(year)).toEqual({ month, day })
  })

  it('isEaster rozpoznaje Wielkanoc', () => {
    expect(isEaster(new Date(2026, 3, 5))).toBe(true)
    expect(isEaster(new Date(2026, 3, 6))).toBe(false)
  })
})
