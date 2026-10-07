/**
 * @vitest-environment jsdom
 * Testy IndulgenceCard - karta odpustu na dziś
 */

import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@tests/utils'
import { IndulgenceCard } from '@/features/user/components/IndulgenceCard'
import { formatDayMonth } from '@/shared/lib/formatters'

describe('IndulgenceCard', () => {
  it('wyświetla nazwy i warunki wszystkich dzisiejszych odpustów', () => {
    renderWithProviders(
      <IndulgenceCard
        indulgences={[
          { id: 1, name: 'Święto Matki Bożej Różańcowej', description: 'Spowiedź i Komunia św.', month: 10, day: 7, year: null, is_easter: false },
          { id: 2, name: 'Drugi odpust', description: null, month: 10, day: 7, year: 2026, is_easter: false },
        ]}
      />
    )

    expect(screen.getByText('Dziś możesz zyskać odpust')).toBeInTheDocument()
    expect(screen.getByText('Święto Matki Bożej Różańcowej')).toBeInTheDocument()
    expect(screen.getByText('Spowiedź i Komunia św.')).toBeInTheDocument()
    expect(screen.getByText('Drugi odpust')).toBeInTheDocument()
  })

  it('formatuje datę odpustu po polsku (także 29 lutego)', () => {
    expect(formatDayMonth(7, 10)).toBe('7 października')
    expect(formatDayMonth(29, 2)).toBe('29 lutego')
  })
})
