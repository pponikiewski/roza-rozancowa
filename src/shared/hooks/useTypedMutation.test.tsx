/**
 * Testy dla hooka useTypedMutation
 * 
 * Testujemy:
 * - Podstawowe działanie mutacji
 * - Wywołanie toast.success po sukcesie
 * - Wywołanie toast.error po błędzie
 * - Invalidację query cache
 * - Wykonanie callbacków
 * - Funkcję execute() zwracającą boolean
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTypedMutation } from './useTypedMutation'
import type { ReactNode } from 'react'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock getErrorMessage
vi.mock('@/shared/lib/utils', () => ({
  getErrorMessage: (err: Error) => err.message,
}))

describe('useTypedMutation', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('powinien wykonać mutację z sukcesem', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: 1 })
    const onSuccessCallback = vi.fn()

    const { result } = renderHook(
      () => useTypedMutation({
        mutationFn,
        successMessage: 'Operacja zakończona sukcesem',
        onSuccessCallback,
      }),
      { wrapper }
    )

    const success = await result.current.execute(undefined)

    expect(success).toBe(true)
    expect(mutationFn).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith('Operacja zakończona sukcesem')
    expect(onSuccessCallback).toHaveBeenCalledWith({ id: 1 })
  })

  it('powinien wyświetlić dynamiczny komunikat sukcesu', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ name: 'Test' })

    const { result } = renderHook(
      () => useTypedMutation<{ name: string }>({
        mutationFn,
        successMessage: (data) => `Utworzono: ${data.name}`,
      }),
      { wrapper }
    )

    await result.current.execute(undefined)

    expect(toast.success).toHaveBeenCalledWith('Utworzono: Test')
  })

  it('powinien obsłużyć błąd mutacji', async () => {
    const error = new Error('Test error')
    const mutationFn = vi.fn().mockRejectedValue(error)
    const onErrorCallback = vi.fn()

    const { result } = renderHook(
      () => useTypedMutation({
        mutationFn,
        successMessage: 'Success',
        errorMessage: 'Wystąpił błąd podczas operacji',
        onErrorCallback,
      }),
      { wrapper }
    )

    const success = await result.current.execute(undefined)

    expect(success).toBe(false)
    expect(toast.error).toHaveBeenCalledWith(
      'Wystąpił błąd podczas operacji',
      { description: 'Test error' }
    )
    expect(onErrorCallback).toHaveBeenCalledWith(error)
  })

  it('powinien invalidować query cache po sukcesie', async () => {
    const mutationFn = vi.fn().mockResolvedValue(undefined)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(
      () => useTypedMutation({
        mutationFn,
        successMessage: 'Success',
        invalidateKeys: [['users'], ['posts']],
      }),
      { wrapper }
    )

    await result.current.execute(undefined)

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledTimes(2)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['posts'] })
    })
  })

  it('powinien używać domyślnej wiadomości błędu', async () => {
    const mutationFn = vi.fn().mockRejectedValue(new Error('Test'))

    const { result } = renderHook(
      () => useTypedMutation({
        mutationFn,
        successMessage: 'Success',
      }),
      { wrapper }
    )

    await result.current.execute(undefined)

    expect(toast.error).toHaveBeenCalledWith(
      'Wystąpił błąd',
      { description: 'Test' }
    )
  })

  it('powinien udostępniać alias loading dla isPending', async () => {
    const mutationFn = vi.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    )

    const { result } = renderHook(
      () => useTypedMutation({
        mutationFn,
        successMessage: 'Success',
      }),
      { wrapper }
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.isPending).toBe(false)

    result.current.execute(undefined)

    await waitFor(() => {
      expect(result.current.loading).toBe(true)
      expect(result.current.isPending).toBe(true)
    })
  })

  it('powinien przekazywać zmienne do mutationFn', async () => {
    const mutationFn = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(
      () => useTypedMutation<void, { name: string; age: number }>({
        mutationFn,
        successMessage: 'Success',
      }),
      { wrapper }
    )

    await result.current.execute({ name: 'John', age: 30 })

    // mutationFn otrzymuje dodatkowy context od React Query, sprawdzamy tylko pierwszy argument
    expect(mutationFn).toHaveBeenCalled()
    expect(mutationFn.mock.calls[0][0]).toEqual({ name: 'John', age: 30 })
  })
})
