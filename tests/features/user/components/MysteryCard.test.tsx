/**
 * @vitest-environment jsdom
 * 
 * Testy MysteryCard - karta wyświetlania tajemnicy różańcowej
 * 
 * Komponent MysteryCard wyświetla przypisaną użytkownikowi tajemnicę
 * wraz z medytacją, obrazem, timerem do zmiany i przyciskiem potwierdzenia modlitwy
 * 
 * Weryfikuje:
 * - Renderowanie podstawowych informacji (nazwa, część różańca, medytacja)
 * - Wyświetlanie obrazu i fallback
 * - Timer do zmiany tajemnicy
 * - Przycisk potwierdzenia modlitwy
 * - Stany: loading, acknowledged, brak tajemnicy
 */

import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, mockMystery } from '../../../utils/test-utils'
import { MysteryCard } from '@/features/user/components/MysteryCard'

describe('MysteryCard', () => {
  // Domyślne propsy używane w większości testów
  const defaultProps = {
    mystery: mockMystery,        // Przykładowa tajemnica
    isAcknowledged: false,       // Modlitwa nie potwierdzona
    actionLoading: false,        // Brak ładowania
    timeLeft: { days: 25, hours: 14, minutes: 30 }, // Czas do zmiany
    onAcknowledge: vi.fn(),      // Mock funkcji potwierdzenia
  }

  /**
   * Test: Renderowanie nazwy tajemnicy
   * Sprawdza czy nazwa tajemnicy jest wyświetlona jako heading
   */
  it('renderuje nazwę tajemnicy', () => {
    renderWithProviders(<MysteryCard {...defaultProps} />)
    
    expect(screen.getByRole('heading', { name: mockMystery.name })).toBeInTheDocument()
  })

  /**
   * Test: Renderowanie części różańca
   * Sprawdza czy wyświetlana jest część różańca (radosne/bolesne/chwalebne/światła)
   */
  it('renderuje część różańca (radosne)', () => {
    renderWithProviders(<MysteryCard {...defaultProps} />)
    
    expect(screen.getByText(mockMystery.part)).toBeInTheDocument()
  })

  /**
   * Test: Renderowanie medytacji
   * Sprawdza czy wyświetlany jest tekst medytacji do tajemnicy
   */
  it('renderuje medytację', () => {
    renderWithProviders(<MysteryCard {...defaultProps} />)
    
    expect(screen.getByText(mockMystery.meditation)).toBeInTheDocument()
  })

  it('renderuje obraz tajemnicy', () => {
    renderWithProviders(<MysteryCard {...defaultProps} />)
    
    const image = screen.getByAltText(mockMystery.name)
    expect(image).toBeInTheDocument()
  })

  it('wyświetla placeholder gdy brak obrazu', () => {
    const mysteryWithoutImage = { ...mockMystery, image_url: null }
    renderWithProviders(
      <MysteryCard {...defaultProps} mystery={mysteryWithoutImage} />
    )
    
    expect(screen.getByText(/brak wizualizacji/i)).toBeInTheDocument()
  })

  it('wyświetla timer do zmiany tajemnic', () => {
    renderWithProviders(<MysteryCard {...defaultProps} />)
    
    expect(screen.getByText(/do zmiany tajemnic/i)).toBeInTheDocument()
    expect(screen.getByText(/25d 14h 30m/)).toBeInTheDocument()
  })

  it('wyświetla przycisk potwierdzenia', () => {
    renderWithProviders(<MysteryCard {...defaultProps} />)
    
    const button = screen.getByRole('button', { name: /zapoznałem się/i })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('wywołuje callback po kliknięciu', async () => {
    const onAcknowledge = vi.fn()
    const { user } = renderWithProviders(
      <MysteryCard {...defaultProps} onAcknowledge={onAcknowledge} />
    )
    
    await user.click(screen.getByRole('button', { name: /zapoznałem się/i }))
    
    expect(onAcknowledge).toHaveBeenCalledTimes(1)
  })

  /**
   * Test: Stan ładowania podczas akcji
   * Podczas wysyłania potwierdzenia przycisk powinien być zablokowany
   * i wyświetlać spinner, aby zapobiec wielokrotnemu kliknięciu
   */
  it('wyświetla loader podczas akcji', () => {
    renderWithProviders(
      <MysteryCard {...defaultProps} actionLoading={true} />
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  /**
   * Test: Stan po potwierdzeniu modlitwy
   * Po potwierdzeniu przycisk zmienia tekst na "Potwierdzone"
   * i staje się nieaktywny
   */
  it('wyświetla status "Potwierdzone"', () => {
    renderWithProviders(
      <MysteryCard {...defaultProps} isAcknowledged={true} />
    )
    
    const button = screen.getByRole('button', { name: /potwierdzone/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  /**
   * Test: Blokada ponownego potwierdzenia
   * Gdy modlitwa jest już potwierdzona, kliknięcie przycisku
   * nie powinno wywoływać funkcji onAcknowledge
   */
  it('nie wywołuje callback gdy już potwierdzone', async () => {
    const onAcknowledge = vi.fn()
    const { user } = renderWithProviders(
      <MysteryCard {...defaultProps} isAcknowledged={true} onAcknowledge={onAcknowledge} />
    )
    
    const button = screen.getByRole('button', { name: /potwierdzone/i })
    await user.click(button)
    
    expect(onAcknowledge).not.toHaveBeenCalled()
  })
})
