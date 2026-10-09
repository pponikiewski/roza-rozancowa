/**
 * @vitest-environment jsdom
 * Testy MysteryCard - karta tajemnicy (3 kluczowe testy)
 */

import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, waitFor, mockMystery } from '@tests/utils'
import { MysteryCard } from '@/features/user/components/MysteryCard'

describe('MysteryCard', () => {
  const defaultProps = {
    mystery: mockMystery,
    isAcknowledged: false,
    actionLoading: false,
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
    
    await user.click(screen.getByRole('button', { name: /potwierdzam zapoznanie/i }))
    
    expect(onAcknowledge).toHaveBeenCalledTimes(1)
  })

  it('otwiera obraz na pełnym ekranie po kliknięciu', async () => {
    const { user } = renderWithProviders(
      <MysteryCard {...defaultProps} mystery={{ ...mockMystery, image_url: '/test.jpg' }} />
    )

    const thumbnail = screen.getByRole('button', { name: /powiększ obraz/i })
    await user.click(thumbnail)

    // Podgląd ładowany leniwie przy pierwszym kliknięciu
    expect(await screen.findByRole('dialog', { name: mockMystery.name })).toBeInTheDocument()

    // Po zamknięciu fokus wraca na miniaturę
    await user.click(screen.getByRole('button', { name: /zamknij/i }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(thumbnail).toHaveFocus()
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
