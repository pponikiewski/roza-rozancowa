/**
 * Testy dla hooka useLogout
 * 
 * Testujemy:
 * - Pomyślne wylogowanie i przekierowanie
 * - Obsługę błędu podczas wylogowania
 * - Przekierowanie mimo błędu (finally block)
 * - Wywołanie toast.error przy błędzie
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'sonner'
import { useLogout } from './useLogout'
import { ROUTES } from '@/shared/lib/constants'
import type { ReactNode } from 'react'

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock AuthContext
const mockSignOut = vi.fn()
vi.mock('@/features/auth/context/AuthContext', async () => {
  const actual = await vi.importActual('@/features/auth/context/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      signOut: mockSignOut,
      user: null,
      loading: false,
    }),
  }
})

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  )

  it('powinien wylogować użytkownika i przekierować na stronę logowania', async () => {
    mockSignOut.mockResolvedValue(undefined)

    const { result } = renderHook(() => useLogout(), { wrapper })
    const logout = result.current

    await logout()

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN, { replace: true })
      expect(toast.error).not.toHaveBeenCalled()
    })
  })

  it('powinien wyświetlić błąd gdy wylogowanie się nie powiedzie', async () => {
    mockSignOut.mockRejectedValue(new Error('Logout failed'))

    const { result } = renderHook(() => useLogout(), { wrapper })
    const logout = result.current

    await logout()

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Błąd wylogowania')
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN, { replace: true })
    })
  })

  it('powinien przekierować mimo błędu (finally block)', async () => {
    mockSignOut.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useLogout(), { wrapper })
    const logout = result.current

    await logout()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN, { replace: true })
    })
  })

  it('powinien używać replace:true podczas nawigacji', async () => {
    mockSignOut.mockResolvedValue(undefined)

    const { result } = renderHook(() => useLogout(), { wrapper })
    const logout = result.current

    await logout()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ replace: true })
      )
    })
  })
})
