/**
 * Testy dla formatters
 * 
 * Testujemy:
 * - Formatowanie nazw miesięcy
 * - Różne formaty dat
 * - Edge cases (nieprawidłowe daty, granice miesiąca)
 * - Polskie nazewnictwo
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  getMonthName, 
  getCurrentMonthName, 
  getCurrentYear, 
  dateFormatters 
} from '@/shared/lib/formatters'
import { setupTimers, cleanupTimers } from '@tests/utils'

describe('Formatters', () => {
  beforeEach(setupTimers)
  afterEach(cleanupTimers)

  describe('getMonthName', () => {
    it('powinien zwrócić poprawną nazwę miesiąca po polsku', () => {
      expect(getMonthName(1)).toBe('styczeń')
      expect(getMonthName(6)).toBe('czerwiec')
      expect(getMonthName(12)).toBe('grudzień')
    })

    it('powinien obsłużyć wszystkie miesiące', () => {
      const expectedMonths = [
        'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
        'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
      ]
      
      expectedMonths.forEach((monthName, index) => {
        expect(getMonthName(index + 1)).toBe(monthName)
      })
    })
  })

  describe('getCurrentMonthName', () => {
    it('powinien zwrócić nazwę aktualnego miesiąca', () => {
      vi.setSystemTime(new Date(2026, 0, 15)) // styczeń 2026
      expect(getCurrentMonthName()).toBe('styczeń')

      vi.setSystemTime(new Date(2026, 5, 15)) // czerwiec 2026
      expect(getCurrentMonthName()).toBe('czerwiec')
    })
  })

  describe('getCurrentYear', () => {
    it('powinien zwrócić aktualny rok', () => {
      vi.setSystemTime(new Date(2026, 0, 15))
      expect(getCurrentYear()).toBe(2026)

      vi.setSystemTime(new Date(2030, 11, 31))
      expect(getCurrentYear()).toBe(2030)
    })
  })

  describe('dateFormatters.fullDateTime', () => {
    it('powinien sformatować datę z godziną', () => {
      const date = new Date(2026, 0, 3, 14, 30)
      const formatted = dateFormatters.fullDateTime(date)
      
      expect(formatted).toContain('3')
      expect(formatted).toContain('stycznia')
      expect(formatted).toContain('14:30')
    })

    it('powinien obsłużyć string jako input', () => {
      const dateString = '2026-01-15T10:30:00'
      const formatted = dateFormatters.fullDateTime(dateString)
      
      expect(formatted).toContain('15')
      expect(formatted).toContain('stycznia')
    })
  })

  describe('dateFormatters.date', () => {
    it('powinien sformatować samą datę', () => {
      const date = new Date(2026, 0, 15)
      const formatted = dateFormatters.date(date)
      
      // Format: DD.MM.RRRR
      expect(formatted).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/)
    })

    it('powinien obsłużyć string jako input', () => {
      const dateString = '2026-01-15'
      const formatted = dateFormatters.date(dateString)
      
      expect(formatted).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/)
    })
  })

  describe('dateFormatters.fullDate', () => {
    it('powinien sformatować pełną datę słownie', () => {
      const date = new Date(2026, 0, 3)
      const formatted = dateFormatters.fullDate(date)
      
      expect(formatted).toContain('3')
      expect(formatted).toContain('stycznia')
      expect(formatted).toContain('2026')
    })
  })

  describe('dateFormatters.monthYear', () => {
    it('powinien sformatować miesiąc i rok', () => {
      const formatted = dateFormatters.monthYear(1, 2026)
      
      expect(formatted).toContain('styczeń')
      expect(formatted).toContain('2026')
    })
  })

  describe('Edge cases', () => {
    it('powinien obsłużyć koniec roku', () => {
      const date = new Date(2026, 11, 31, 23, 59)
      const formatted = dateFormatters.fullDateTime(date)
      
      expect(formatted).toContain('31')
      expect(formatted).toContain('grudnia')
      expect(formatted).toContain('23:59')
    })

    it('powinien obsłużyć początek roku', () => {
      const date = new Date(2026, 0, 1, 0, 0)
      const formatted = dateFormatters.fullDateTime(date)
      
      expect(formatted).toContain('1')
      expect(formatted).toContain('stycznia')
      expect(formatted).toContain('00:00')
    })
  })
})
