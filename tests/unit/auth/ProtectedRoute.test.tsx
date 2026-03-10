/**
 * @vitest-environment jsdom
 * Testy ProtectedRoute - ochrona tras (2 kluczowe testy)
 */

import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, waitFor, mockUser, mockSession } from '@tests/utils'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { AuthContext } from '@/features/auth/context/AuthContext'
import { Route, Routes } from 'react-router-dom'

const ProtectedPage = () => <div>Protected Content</div>

describe('ProtectedRoute', () => {
  it('przekierowuje niezalogowanego użytkownika', async () => {
    const authValue = {
      user: null,
      session: null,
      loading: false,
      isAdmin: false,
      signOut: vi.fn(),
    }

    renderWithProviders(
      <AuthContext.Provider value={authValue}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    )

    await waitFor(() => {
      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
    })
  })

  it('wpuszcza zalogowanego użytkownika', async () => {
    const authValue = {
      user: mockUser,
      session: mockSession,
      loading: false,
      isAdmin: false,
      signOut: vi.fn(),
    }

    renderWithProviders(
      <AuthContext.Provider value={authValue}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    )

    await waitFor(() => {
      expect(screen.getByText(/protected content/i)).toBeInTheDocument()
    })
  })
})
