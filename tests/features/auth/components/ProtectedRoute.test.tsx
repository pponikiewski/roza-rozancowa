/**
 * @vitest-environment jsdom
 * 
 * Testy ProtectedRoute i AdminRoute - komponenty ochrony tras
 * 
 * ProtectedRoute - chroni trasy przed dostępem niezalogowanych użytkowników
 * AdminRoute - chroni trasy administracyjne, wymaga uprawnień admina
 * 
 * Weryfikuje:
 * - Stan ładowania (loader)
 * - Przekierowania dla niezalogowanych
 * - Dostęp dla zalogowanych użytkowników
 * - Kontrola dostępu dla administratorów
 */

import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, waitFor, mockUser, mockSession } from '../../../utils/test-utils'
import { ProtectedRoute, AdminRoute } from '@/features/auth/components/ProtectedRoute'
import { AuthContext } from '@/features/auth/context/AuthContext'
import { Route, Routes } from 'react-router-dom'

// Komponenty testowe reprezentujące chronione strony
const ProtectedPage = () => <div>Protected Content</div>
const AdminPage = () => <div>Admin Content</div>

describe('ProtectedRoute', () => {
  /**
   * Test: Wyświetlanie loadera podczas sprawdzania autoryzacji
   * Gdy loading=true, komponent powinien pokazać spinner
   * zamiast treści lub przekierowania
   */
  it('pokazuje loader gdy loading=true', () => {
    const authValue = {
      user: null,
      session: null,
      loading: true, // Symulujemy stan ładowania
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

    // Sprawdzamy czy widoczny jest spinner animowany
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  /**
   * Test: Przekierowanie niezalogowanego użytkownika
   * Użytkownicy bez sesji nie powinni mieć dostępu do chronionych tras
   * i powinni zostać przekierowani na stronę logowania
   */
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

    // Sprawdzamy że chroniona treść NIE jest widoczna (użytkownik przekierowany)
    await waitFor(() => {
      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
    })
  })

  /**
   * Test: Dostęp dla zalogowanego użytkownika
   * Użytkownicy z ważną sesją powinni mieć dostęp do chronionych tras
   */
  it('wpuszcza zalogowanego użytkownika', async () => {
    const authValue = {
      user: mockUser,      // Użytkownik zalogowany
      session: mockSession, // Ważna sesja
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

    // Sprawdzamy czy chroniona treść jest widoczna
    await waitFor(() => {
      expect(screen.getByText(/protected content/i)).toBeInTheDocument()
    })
  })
})

describe('AdminRoute', () => {
  /**
   * Test: Blokowanie dostępu zwykłych użytkowników
   * Trasy administracyjne wymagają uprawnień admina
   * Zwykli użytkownicy powinni zostać przekierowani
   */
  it('przekierowuje zwykłego użytkownika', async () => {
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
          <Route element={<AdminRoute />}>
            <Route path="/" element={<AdminPage />} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    )

    // Sprawdzamy że panel admina NIE jest widoczny
    await waitFor(() => {
      expect(screen.queryByText(/admin content/i)).not.toBeInTheDocument()
    })
  })

  /**
   * Test: Dostęp dla administratorów
   * Użytkownicy z flagą isAdmin=true powinni mieć pełny dostęp
   * do tras administracyjnych
   */
  it('wpuszcza administratora', async () => {
    const authValue = {
      user: { ...mockUser, id: 'admin-id', email: 'admin@example.com' },
      session: mockSession,
      loading: false,
      isAdmin: true, // Użytkownik z uprawnieniami admina
      signOut: vi.fn(),
    }

    renderWithProviders(
      <AuthContext.Provider value={authValue}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/" element={<AdminPage />} />
          </Route>
        </Routes>
      </AuthContext.Provider>,
      { initialEntries: ['/'] } // Ustawiamy początkową trasę
    )

    // Sprawdzamy czy panel admina jest widoczny
    await waitFor(() => {
      expect(screen.getByText(/admin content/i)).toBeInTheDocument()
    })
  })
})
