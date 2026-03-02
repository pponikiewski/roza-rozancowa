/**
 * @vitest-environment jsdom
 * 
 * Testy LoginPage - strona logowania
 * 
 * Sprawdza funkcjonalność formularza logowania:
 * - renderowanie elementów UI (przyciski, inputy)
 * - walidację pól formularza (login, hasło)
 * - pomyślne logowanie użytkownika
 * - obsługę błędów logowania
 * - stan ładowania podczas procesu logowania
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, waitFor, mockUser, mockSession } from '../../../utils/test-utils'
import LoginPage from '@/features/auth/pages/LoginPage'
import { authService } from '@/features/auth/api/auth.service'
import { AuthContext } from '@/features/auth/context/AuthContext'
import { toast } from 'sonner'

// Mock serwisów - zastępujemy prawdziwe wywołania API mockami
vi.mock('@/features/auth/api/auth.service', () => ({
  authService: {
    signIn: vi.fn(), // Mock funkcji logowania
  },
}))

// Mock biblioteki toast (powiadomienia)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(), // Mock powiadomień sukcesu
    error: vi.fn(),   // Mock powiadomień błędu
  },
}))

// Mock kontekstu autoryzacji - symuluje stan niezalogowanego użytkownika
const mockAuthContext = {
  user: null,
  session: null,
  loading: false,
  isAdmin: false,
  signOut: vi.fn(),
}

describe('LoginPage', () => {
  // Czyszczenie mocków przed każdym testem
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test: Sprawdza czy formularz logowania renderuje się poprawnie
   * Weryfikuje obecność kluczowych elementów: przycisk logowania, pole login, pole hasła
   */
  it('renderuje formularz logowania', () => {
    // Renderujemy komponent z mockiem kontekstu
    renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    )

    // Sprawdzamy czy wszystkie kluczowe elementy są w dokumencie
    expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  /**
   * Test: Walidacja pustego pola login
   * Sprawdza czy formularz wyświetla komunikat błędu gdy użytkownik
   * próbuje zalogować się bez podania loginu
   */
  it('waliduje pusty login', async () => {
    const { user } = renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    )

    // Klikamy przycisk logowania bez wypełnienia formularza
    await user.click(screen.getByRole('button', { name: /zaloguj/i }))

    // Sprawdzamy czy pojawił się komunikat błędu walidacji
    await waitFor(() => {
      expect(screen.getByText(/login musi mieć minimum 3 znaki/i)).toBeInTheDocument()
    })
  })

  /**
   * Test: Walidacja typu pola login
   * Sprawdza czy pole login ma atrybut type="text"
   */
  it('pole login ma typ text', async () => {
    renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    )

    const loginInput = screen.getByRole('textbox', { name: /login/i }) as HTMLInputElement
    expect(loginInput.type).toBe('text')
  })

  /**
   * Test: Pomyślne logowanie użytkownika
   * Weryfikuje cały flow logowania:
   * 1. Wypełnienie formularza
   * 2. Wywołanie API logowania
   * 3. Wyświetlenie powiadomienia o sukcesie
   */
  it('pomyślnie loguje użytkownika', async () => {
    // Mockujemy pomyślną odpowiedź API
    vi.mocked(authService.signIn).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    } as any)

    const { user } = renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    )

    // Pobieramy referencje do elementów formularza
    const loginInput = screen.getByRole('textbox', { name: /login/i })
    const passwordInput = screen.getByPlaceholderText('••••••••')

    // Symulujemy wpisywanie danych i kliknięcie przycisku
    await user.type(loginInput, 'jan.kowalski')
    await user.type(passwordInput, 'password123')
    await user.click(screen.getByRole('button', { name: /zaloguj/i }))

    // Sprawdzamy czy API zostało wywołane z poprawnymi parametrami
    // oraz czy wyświetlono powiadomienie sukcesu
    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith('jan.kowalski', 'password123')
      expect(toast.success).toHaveBeenCalledWith('Zalogowano pomyślnie')
    })
  })

  /**
   * Test: Obsługa błędu logowania
   * Sprawdza czy przy niepoprawnych danych logowania
   * wyświetla się powiadomienie o błędzie
   */
  it('wyświetla błąd przy niepoprawnych danych', async () => {
    // Mockujemy odrzucenie obietnicy API (błąd logowania)
    vi.mocked(authService.signIn).mockRejectedValue(new Error('Invalid credentials'))

    const { user } = renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    )

    const loginInput = screen.getByRole('textbox', { name: /login/i })
    const passwordInput = screen.getByPlaceholderText('••••••••')

    // Wpisujemy niepoprawne dane
    await user.type(loginInput, 'zly.login')
    await user.type(passwordInput, 'wrongpass')
    await user.click(screen.getByRole('button', { name: /zaloguj/i }))

    // Sprawdzamy czy wyświetlono komunikat błędu
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })

  /**
   * Test: Blokowanie formularza podczas ładowania
   * Sprawdza czy podczas procesu logowania (async)
   * pola formularza są zablokowane (disabled)
   * aby zapobiec wielokrotnemu wysłaniu formularza
   */
  it('blokuje formularz podczas ładowania', async () => {
    // Mockujemy opóźnioną odpowiedź API (symulacja ładowania)
    vi.mocked(authService.signIn).mockImplementation(() =>
      new Promise((resolve) => setTimeout(resolve, 1000))
    )

    const { user } = renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    )

    const loginInput = screen.getByRole('textbox', { name: /login/i })
    const passwordInput = screen.getByPlaceholderText('••••••••')

    await user.type(loginInput, 'jan.kowalski')
    await user.type(passwordInput, 'password123')
    await user.click(screen.getByRole('button', { name: /zaloguj/i }))

    // Sprawdzamy czy pola są zablokowane podczas ładowania
    await waitFor(() => {
      expect(loginInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
    })
  })
})
