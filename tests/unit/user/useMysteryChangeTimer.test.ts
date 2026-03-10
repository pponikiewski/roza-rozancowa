/**
 * Testy useMysteryChangeTimer - timer zmiany tajemnic (1 kluczowy test)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMysteryChangeTimer } from '@/features/user/hooks/useMysteryChangeTimer'
import { setupTimers, cleanupTimers } from '@tests/utils'

describe('useMysteryChangeTimer', () => {
  beforeEach(setupTimers)
  afterEach(cleanupTimers)

  it('oblicza pierwszą niedzielę następnego miesiąca i pozostały czas', () => {
    // 15 stycznia 2026, 12:00
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))

    const { result } = renderHook(() => useMysteryChangeTimer())

    // Pierwsza niedziela lutego 2026 to 1 lutego
    expect(result.current.targetDate).toEqual(new Date(2026, 1, 1, 0, 0, 0, 0))
    expect(result.current.timeLeft.days).toBe(16)
    expect(result.current.timeLeft.hours).toBe(12)
  })
})
