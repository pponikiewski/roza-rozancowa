/**
 * Helpery do testowania hooks w Vitest
 * 
 * Zawiera:
 * - createTestQueryClient() - klient React Query dla testów hooks
 * - renderHookWithQuery() - renderowanie hooka z QueryClientProvider
 * - setupTimers() - konfiguracja fake timers
 */

import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook as baseRenderHook } from '@testing-library/react'
import { vi } from 'vitest'
import type { ReactNode } from 'react'
import { createTestQueryClient } from './test-utils'

/**
 * Renderuje hook z QueryClientProvider
 * 
 * @example
 * const { result } = renderHookWithQuery(() => useTypedMutation({ ... }))
 */
export function renderHookWithQuery<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: { initialProps?: TProps }
) {
  const queryClient = createTestQueryClient()
  
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  return {
    ...baseRenderHook(hook, { wrapper, ...options }),
    queryClient,
  }
}

/**
 * Konfiguruje fake timers dla testów
 * Użyj w beforeEach + cleanup w afterEach
 * 
 * @example
 * beforeEach(() => { setupTimers() })
 * afterEach(() => { cleanupTimers() })
 */
export function setupTimers() {
  vi.useFakeTimers()
}

/**
 * Czyści fake timers
 */
export function cleanupTimers() {
  vi.useRealTimers()
}

/**
 * Czyści wszystkie mocki
 * Użyj w beforeEach dla izolacji testów
 */
export function clearAllMocks() {
  vi.clearAllMocks()
}
