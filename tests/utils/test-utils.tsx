/**
 * Test utilities - narzędzia pomocnicze do testów
 * 
 * Ten plik zawiera:
 * - renderWithProviders() - funkcję do renderowania komponentów z providerami
 * - Mock danych (mockUser, mockSession, mockMystery)
 * - Re-eksport funkcji z @testing-library
 * 
 * Używany przez wszystkie pliki testowe do zapewnienia spójnego środowiska testowego
 */

import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

/**
 * Tworzy klienta TanStack Query dla testów
 * - Wyłącza automatyczne retry (błędy pojawiają się natychmiast)
 * - Ustawia gcTime na 0 (brak cache'owania między testami)
 * Zapewnia izolację między testami
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

/**
 * Opcje renderowania z dodatkowymi możliwościami
 * - initialEntries: początkowa ścieżka routera (dla MemoryRouter)
 */
type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  initialEntries?: string[]
}

/**
 * Tworzy wrapper z wszystkimi niezbędnymi providerami
 * - QueryClientProvider (TanStack Query)
 * - Router (BrowserRouter lub MemoryRouter)
 * 
 * @param initialEntries - jeśli podane, używa MemoryRouter z tą ścieżką
 */
function createAllTheProvidersWrapper(initialEntries?: string[]) {
  return function AllTheProviders({ children }: { children: React.ReactNode }) {
    const testQueryClient = createTestQueryClient()
    const Router = initialEntries ? MemoryRouter : BrowserRouter
    const routerProps = initialEntries ? { initialEntries } : {}
    
    return (
      <Router {...routerProps}>
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      </Router>
    )
  }
}

/**
 * Renderuje komponent z wszystkimi niezbędnymi providerami
 * 
 * @param ui - Komponent React do wyrenderowania
 * @param options - Opcje renderowania (w tym initialEntries dla routingu)
 * @returns Obiekt z funkcjami Testing Library + user (userEvent)
 * 
 * Przykład użycia:
 * ```tsx
 * const { user } = renderWithProviders(<MyComponent />)
 * await user.click(screen.getByRole('button'))
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { initialEntries, ...renderOptions } = options || {}
  const AllTheProviders = createAllTheProvidersWrapper(initialEntries)
  
  return {
    ...render(ui, { wrapper: AllTheProviders, ...renderOptions }),
    user: userEvent.setup(),
  }
}

/**
 * Mock użytkownika Supabase
 * Zawiera wszystkie pola wymagane przez typ User z @supabase/supabase-js
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  updated_at: new Date().toISOString(),
}

/**
 * Mock sesji Supabase
 * Reprezentuje zalogowanego użytkownika z tokenem JWT
 * token_type: 'bearer' as const - zapewnia zgodność z literalnym typem
 */
export const mockSession = {
  access_token: 'test-token',
  refresh_token: 'test-refresh',
  expires_in: 3600,
  token_type: 'bearer' as const,
  user: mockUser,
}

/**
 * Mock tajemnicy różańcowej
 * Przykład: Zwiastowanie NMP (pierwsza tajemnica radosna)
 * - part: rodzaj tajemnicy (radosne, świetlne, bolesne, chwalebne)
 * - name: nazwa tajemnicy
 * - meditation: tekst do rozważania
 * - image_url: ścieżka do obrazka ilustrującego tajemnicę
 */
export const mockMystery = {
  id: 1,
  part: 'radosne' as const,
  name: 'Zwiastowanie NMP',
  meditation: 'Rozważamy jak Archanioł Gabriel zwiastował Maryi...',
  image_url: '/mysteries/1.jpg',
}

// Re-export wszystkich funkcji z @testing-library/react dla wygody
// (screen, waitFor, within, itp.)
export * from '@testing-library/react'
export { userEvent }

