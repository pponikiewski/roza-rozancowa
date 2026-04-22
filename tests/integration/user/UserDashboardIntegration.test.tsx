/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, waitFor, mockUser } from '@tests/utils'
import userEvent from '@testing-library/user-event'
import UserPage from '@/features/user/pages/UserPage'
import { userService } from '@/features/user/api/user.service'
import { toast } from 'sonner'
import * as utils from '@/shared/lib/utils'

// Mockujemy zewnętrzną bibliotekę do notyfikacji
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}))

// Mockujemy zewnętrzne hooki ze stanem globalnym
vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    session: null,
    isAdmin: false
  })
}))

// Mockujemy same funkcje komunikujące się z API backendu
vi.mock('@/features/user/api/user.service', () => ({
  userService: {
    getProfile: vi.fn(),
    getCurrentIntention: vi.fn(),
    getUserMystery: vi.fn(),
    checkAcknowledgment: vi.fn(),
    acknowledgeMystery: vi.fn(),
    getGroupMembersByUserId: vi.fn(),
  },
}))

describe('Integracja: Panel Użytkownika (UserPage)', () => {
  // Ustawienie początkowych symulacji przed każdym testem
  beforeEach(() => {
    vi.clearAllMocks()

    // 1. Zmockowany własny profil (jest w konkretnej Róży np. id 1, rose_pos 3)
    vi.mocked(userService.getProfile).mockResolvedValue({
      id: mockUser.id,
      full_name: 'Jan Testowy',
      role: 'user',
      group_id: 1,
      rose_pos: 3,
      created_at: new Date().toISOString(),
      group: { id: 1, name: 'Róża Testowa' }
    } as any)

    // 2. Intencja papieska / parafialna na ten miesiąc
    vi.mocked(userService.getCurrentIntention).mockResolvedValue({
      title: 'O pokój na świecie',
      content: 'Módlmy się o rychłe zakończenie konfliktów',
      month: 3,
      year: 2026,
      created_at: new Date().toISOString()
    } as any)

    // 3. Osobista Tajemnica różańcowa wyliczona na ten miesiąc
    vi.mocked(userService.getUserMystery).mockResolvedValue({
      id: 3,
      name: 'Narodzenie Pana Jezusa',
      part: 'Radosna',
      meditation: 'Treść rozważania o Narodzeniu...',
      image_url: 'narodzenie.jpg'
    })

    // 4. Domylście zakładamy, że jeszcze NIE potwierdził przeczytania
    vi.mocked(userService.checkAcknowledgment).mockResolvedValue(false)
  })

  it('powinien pobrać i wyświetlić aktualną tajemnicę użytkownika i intencję', async () => {
    // Renderuje z wstrzykniętą informacją, o zalogowanym użytkowniku na mockUser
    renderWithProviders(<UserPage />)

    // W React-Query pojawia się status loading zanim zapytania się zakończą
    expect(screen.getByText(/Ładowanie/i)).toBeInTheDocument()

    // Sprawdzamy czy pobrana intencja zjawi się u UI (Czekamy, aż zniknie loader i wyrenderuje się treść)
    await waitFor(() => {
      expect(screen.getByText(/O pokój na świecie/i)).toBeInTheDocument()
    })

    // Sprawdzamy zawartość samej tajemnicy
    expect(screen.getByText('Narodzenie Pana Jezusa')).toBeInTheDocument()
    expect(screen.getByText(/Radosna/i)).toBeInTheDocument()

    // Sprawdzamy, czy wywołano serwisy
    expect(userService.getProfile).toHaveBeenCalledTimes(1)
    expect(userService.getUserMystery).toHaveBeenCalledTimes(1)
    expect(userService.getCurrentIntention).toHaveBeenCalledTimes(1)
  })

  it('pozwala użytkownikowi zatwierdzić przeczytanie tajemnicy', async () => {
    renderWithProviders(<UserPage />)
    const user = userEvent.setup()

    // Oczekujemy, że przycisk się załaduje
    const confirmButton = await screen.findByRole('button', { name: /Zapoznałem|potwierdź/i })
    expect(confirmButton).toBeInTheDocument()
    expect(confirmButton).not.toBeDisabled()

    // Podmienić reakcję powrotu po udanym zapisie
    vi.mocked(userService.checkAcknowledgment).mockResolvedValueOnce(true)

    // Symulacja kliknięcia przycisku
    await user.click(confirmButton)

    // Oczekujemy, że została odpialona funkcja save do zewnętrznego API
    await waitFor(() => {
      expect(userService.acknowledgeMystery).toHaveBeenCalledWith(mockUser.id, 3)
    })
  })
})


