/**
 * @vitest-environment jsdom
 * Testy LoginPage - strona logowania 
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, waitFor, mockUser, mockSession } from '@tests/utils'
import LoginPage from '@/features/auth/pages/LoginPage'
import { authService } from '@/features/auth/api/auth.service'
import { AuthContext } from '@/features/auth/context/AuthContext'
import { toast } from 'sonner'

vi.mock('@/features/auth/api/auth.service', () => ({
  authService: { signIn: vi.fn() },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mockAuthContext = {
  user: null,
  session: null,
  loading: false,
  isAdmin: false,
  signOut: vi.fn(),
}

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderuje formularz logowania', () => {
    renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    )

    expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('pomyślnie loguje użytkownika', async () => {
    vi.mocked(authService.signIn).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    } as any)

    const { user } = renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    )

    await user.type(screen.getByRole('textbox', { name: /login/i }), 'jan.kowalski')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await user.click(screen.getByRole('button', { name: /zaloguj/i }))

    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith('jan.kowalski', 'password123')
      expect(toast.success).toHaveBeenCalledWith('Zalogowano pomyślnie')
    })
  })

  it('wyświetla błąd przy niepoprawnych danych', async () => {
    vi.mocked(authService.signIn).mockRejectedValue(new Error('Invalid credentials'))

    const { user } = renderWithProviders(
      <AuthContext.Provider value={mockAuthContext}>
        <LoginPage />
      </AuthContext.Provider>
    )

    await user.type(screen.getByRole('textbox', { name: /login/i }), 'zly.login')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /zaloguj/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })
})
