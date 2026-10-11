/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, waitFor, mockUser } from '@tests/utils'
import userEvent from '@testing-library/user-event'
import AdminIntentionsPage from '@/features/admin/intentions/pages/AdminIntentionsPage'
import { intentionsService } from '@/features/admin/intentions/api/intentions.service'

// Mockowanie powiadomień
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}))

// Mockowanie globalnego kontekstu autoryzacji (ustawiamy jako admin)
vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    session: null,
    isAdmin: true
  })
}))

// Mockujemy wywołania do API backendu
vi.mock('@/features/admin/intentions/api/intentions.service', () => ({
  intentionsService: {
    getIntentionsHistory: vi.fn(),
    saveIntention: vi.fn(),
    updateIntention: vi.fn(),
    deleteIntention: vi.fn()
  }
}))

describe('Integracja: Panel Administratora - Zarządzanie Intencjami', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Udajemy wcześniejszą historię intencji w bazie danych
    vi.mocked(intentionsService.getIntentionsHistory).mockResolvedValue([
      {
        id: 1,
        title: 'O powołania',
        content: 'Módlmy się o nowe powołania...',
        month: 2,
        year: 2026
      } as any,
      {
        id: 2,
        title: 'Za chorych',
        content: 'Modlitwa za cierpiących na świecie...',
        month: 1,
        year: 2026
      } as any
    ])
  })

  it('powinien załadować i wyświetlić historię intencji z bazy', async () => {
    renderWithProviders(<AdminIntentionsPage />)

    // Sprawdzamy czy aplikacja próbuje pociągnąć dane
    expect(intentionsService.getIntentionsHistory).toHaveBeenCalledTimes(1)

    // Oczekujemy że archiwalne wartości z mocka pojawią się w tabeli/historii
    await waitFor(() => {
      expect(screen.getByText('O powołania')).toBeInTheDocument()
      expect(screen.getByText('Za chorych')).toBeInTheDocument()
    })
  })

  it('w miesiącu bez intencji pokazuje pusty formularz nowej intencji', async () => {
    renderWithProviders(<AdminIntentionsPage />)

    await screen.findByText('O powołania')
    expect(screen.getByRole('heading', { name: /^Nowa intencja na/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/Nagłówek/i)).toHaveValue('')
    expect(screen.getByLabelText(/Treść modlitwy/i)).toHaveValue('')
  })

  it('intencja na bieżący miesiąc zostaje w formularzu i zapis ją poprawia', async () => {
    const now = new Date()
    vi.mocked(intentionsService.getIntentionsHistory).mockResolvedValue([
      {
        id: 3,
        title: 'Za rodziny',
        content: 'Módlmy się za rodziny naszej parafii.',
        month: now.getMonth() + 1,
        year: now.getFullYear()
      }
    ])
    vi.mocked(intentionsService.saveIntention).mockResolvedValue(undefined)

    renderWithProviders(<AdminIntentionsPage />)
    const user = userEvent.setup()

    const titleInput = screen.getByLabelText(/Nagłówek/i)
    await waitFor(() => expect(titleInput).toHaveValue('Za rodziny'))
    expect(screen.getByLabelText(/Treść modlitwy/i)).toHaveValue('Módlmy się za rodziny naszej parafii.')
    expect(screen.getByRole('heading', { name: /^Intencja na/ })).toBeInTheDocument()

    await user.type(titleInput, ' i małżeństwa')
    await user.click(screen.getByRole('button', { name: /Zapisz zmiany/i }))

    await waitFor(() => {
      expect(intentionsService.saveIntention).toHaveBeenCalledWith(
        'Za rodziny i małżeństwa',
        'Módlmy się za rodziny naszej parafii.'
      )
    })
  })

  it('pozwala administratorowi na dodanie nowej intencji', async () => {
    // Odpowiedź zapisu – symulacja sukcesu z bazy (np. saveIntention zwraca nowo zapisany obiekt lub true w zależności od API)
    vi.mocked(intentionsService.saveIntention).mockResolvedValue(true as any)

    renderWithProviders(<AdminIntentionsPage />)
    const user = userEvent.setup()

    // Musimy poczekać, aż początkowe ładowanie historii z bazy minie, bo przycisk ma napis "Zapisywanie..." podczas ładowania strony wg designu
    const submitBtn = await screen.findByRole('button', { name: /Zapisz Intencję/i })

    // 1. Zlokalizuj pola formularza po odpowiednich etykietach
    const titleInput = screen.getByLabelText(/Nagłówek/i)
    const contentTextarea = screen.getByLabelText(/Treść modlitwy/i)

    // 2. Wpisz nowe dane
    await user.type(titleInput, 'Nowa intencja na kwiecień')
    await user.type(contentTextarea, 'Przykładowa treść nowej intencji dla całego kościoła.')

    // 3. Sprawdź, czy wpisane wartości tam są
    expect(titleInput).toHaveValue('Nowa intencja na kwiecień')
    expect(contentTextarea).toHaveValue('Przykładowa treść nowej intencji dla całego kościoła.')

    // 4. Zatwierdź zapis do bazy
    await user.click(submitBtn)

    // 5. Czekamy aż wykona się mockowana akcja wywoła do Supabase
    await waitFor(() => {
      expect(intentionsService.saveIntention).toHaveBeenCalledTimes(1)
      expect(intentionsService.saveIntention).toHaveBeenCalledWith(
        'Nowa intencja na kwiecień',
        'Przykładowa treść nowej intencji dla całego kościoła.'
      )
    })
  })
})
