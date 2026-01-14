/**
 * Testy dla hooka useMysteryChangeTimer
 * 
 * Testujemy:
 * - Obliczanie pierwszej niedzieli następnego miesiąca
 * - Obliczanie pozostałego czasu (dni, godziny, minuty)
 * - Ustawienie godziny na północ (00:00:00)
 * - Edge cases (różne dni tygodnia początku miesiąca)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMysteryChangeTimer } from '@/features/user/hooks/useMysteryChangeTimer'
import { setupTimers, cleanupTimers } from '@tests/utils'

describe('useMysteryChangeTimer', () => {
  beforeEach(setupTimers)
  afterEach(cleanupTimers)

  it('powinien obliczyć pierwszą niedzielę następnego miesiąca', () => {
    // 15 stycznia 2026 (czwartek)
    vi.setSystemTime(new Date(2026, 0, 15, 14, 30, 0))

    const { result } = renderHook(() => useMysteryChangeTimer())

    // Pierwszy dzień lutego 2026 to sobota, więc pierwsza niedziela to 1 lutego
    expect(result.current.targetDate).toEqual(new Date(2026, 1, 1, 0, 0, 0, 0))
  })

  it('powinien obliczyć pozostały czas poprawnie', () => {
    // 15 stycznia 2026, 12:00
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))

    const { result } = renderHook(() => useMysteryChangeTimer())

    // Do 1 lutego (pierwsza niedziela) pozostaje:
    // 31 - 15 = 16 dni w styczniu + 1 dzień w lutym = 17 dni
    // Minus 12 godzin = 16 dni i 12 godzin
    expect(result.current.timeLeft.days).toBe(16)
    expect(result.current.timeLeft.hours).toBe(12)
    expect(result.current.timeLeft.minutes).toBe(0)
  })

  it('powinien ustawić datę docelową na północ', () => {
    vi.setSystemTime(new Date(2026, 0, 20, 15, 45, 30))

    const { result } = renderHook(() => useMysteryChangeTimer())

    const target = result.current.targetDate
    expect(target?.getHours()).toBe(0)
    expect(target?.getMinutes()).toBe(0)
    expect(target?.getSeconds()).toBe(0)
    expect(target?.getMilliseconds()).toBe(0)
  })

  it('powinien obsłużyć przypadek gdy pierwszy dzień miesiąca to niedziela', () => {
    // 28 lutego 2026 (sobota) - następny miesiąc (marzec) zaczyna się w niedzielę
    vi.setSystemTime(new Date(2026, 1, 28, 10, 0, 0))

    const { result } = renderHook(() => useMysteryChangeTimer())

    // Pierwsza niedziela marca 2026 to 1 marca (pierwszy dzień)
    expect(result.current.targetDate?.getDate()).toBe(1)
    expect(result.current.targetDate?.getMonth()).toBe(2) // marzec (0-indexed)
  })

  it('powinien obsłużyć przypadek gdy pierwszy dzień miesiąca to poniedziałek', () => {
    // 30 czerwca 2026 - następny miesiąc (lipiec) zaczyna się w środę
    vi.setSystemTime(new Date(2026, 5, 30, 10, 0, 0))

    const { result } = renderHook(() => useMysteryChangeTimer())

    // 1 lipca 2026 to środa, więc pierwsza niedziela to 5 lipca
    expect(result.current.targetDate?.getDate()).toBe(5)
    expect(result.current.targetDate?.getMonth()).toBe(6) // lipiec
  })

  it('powinien zwrócić poprawną strukturę timeLeft', () => {
    vi.setSystemTime(new Date(2026, 0, 15, 10, 30, 0))

    const { result } = renderHook(() => useMysteryChangeTimer())

    expect(result.current.timeLeft).toHaveProperty('days')
    expect(result.current.timeLeft).toHaveProperty('hours')
    expect(result.current.timeLeft).toHaveProperty('minutes')
    expect(typeof result.current.timeLeft.days).toBe('number')
    expect(typeof result.current.timeLeft.hours).toBe('number')
    expect(typeof result.current.timeLeft.minutes).toBe('number')
  })

  it('powinien zawsze zwracać dodatnie wartości czasu', () => {
    vi.setSystemTime(new Date(2026, 0, 15, 23, 59, 0))

    const { result } = renderHook(() => useMysteryChangeTimer())

    expect(result.current.timeLeft.days).toBeGreaterThanOrEqual(0)
    expect(result.current.timeLeft.hours).toBeGreaterThanOrEqual(0)
    expect(result.current.timeLeft.minutes).toBeGreaterThanOrEqual(0)
  })
})
