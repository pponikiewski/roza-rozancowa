/**
 * @vitest-environment jsdom
 * Testy MysteryCard - karta tajemnicy (3 kluczowe testy)
 */

import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, mockMystery } from '@tests/utils'
import { MysteryCard } from '@/features/user/components/MysteryCard'

describe('MysteryCard', () => {
  const defaultProps = {
    mystery: mockMystery,
    isAcknowledged: false,
    actionLoading: false,
    timeLeft: { days: 25, hours: 14, minutes: 30 },
    onAcknowledge: vi.fn(),
  }

  it('renderuje nazwę tajemnicy', () => {
    renderWithProviders(<MysteryCard {...defaultProps} />)
    
    expect(screen.getByRole('heading', { name: mockMystery.name })).toBeInTheDocument()
    expect(screen.getByText(mockMystery.part)).toBeInTheDocument()
  })

  it('wywołuje callback po kliknięciu przycisku', async () => {
    const onAcknowledge = vi.fn()
    const { user } = renderWithProviders(
      <MysteryCard {...defaultProps} onAcknowledge={onAcknowledge} />
    )
    
    await user.click(screen.getByRole('button', { name: /zapoznałem się/i }))
    
    expect(onAcknowledge).toHaveBeenCalledTimes(1)
  })

  it('wyświetla status potwierdzone i blokuje przycisk', async () => {
    const onAcknowledge = vi.fn()
    const { user } = renderWithProviders(
      <MysteryCard {...defaultProps} isAcknowledged={true} onAcknowledge={onAcknowledge} />
    )
    
    const button = screen.getByRole('button', { name: /potwierdzone/i })
    expect(button).toBeDisabled()
    
    await user.click(button)
    expect(onAcknowledge).not.toHaveBeenCalled()
  })
})
