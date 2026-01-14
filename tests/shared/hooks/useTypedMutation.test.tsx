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

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderHookWithQuery, clearAllMocks } from '@tests/utils'

// Mockujemy sonner - vi.mock jest automatycznie hoistowany
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}))

// Mockujemy utils
vi.mock('@/shared/lib/utils', () => ({
  getErrorMessage: (error: Error) => error.message,
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

import { useTypedMutation } from '@/shared/hooks/useTypedMutation'
import { toast } from 'sonner'

// Teraz uzyskujemy dostęp do zmockowanego toast
const mockToast = vi.mocked(toast)

describe('useTypedMutation', () => {
  beforeEach(() => {
    clearAllMocks()
  })

  it('powinien wykonać mutację z sukcesem', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: 1 })
    const onSuccessCallback = vi.fn()

    const { result } = renderHookWithQuery(() => useTypedMutation({
      mutationFn,
      successMessage: 'Operacja zakończona sukcesem',
      onSuccessCallback,
    }))

    const success = await result.current.execute(undefined)

    await waitFor(() => {
      expect(success).toBe(true)
      expect(mutationFn).toHaveBeenCalledTimes(1)
      expect(mockToast.success).toHaveBeenCalledWith('Operacja zakończona sukcesem')
      expect(onSuccessCallback).toHaveBeenCalledWith({ id: 1 })
    })
  })

  it('powinien wyświetlić dynamiczny komunikat sukcesu', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ name: 'Test' })

    const { result } = renderHookWithQuery(() => useTypedMutation({
      mutationFn,
      successMessage: (data) => `Utworzono: ${data.name}`,
    }))

    await result.current.execute(undefined)

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Utworzono: Test')
    })
  })

  it('powinien obsłużyć błąd mutacji', async () => {
    const error = new Error('Test error')
    const mutationFn = vi.fn().mockRejectedValue(error)
    const onErrorCallback = vi.fn()

    const { result } = renderHookWithQuery(() => useTypedMutation({
      mutationFn,
      successMessage: 'Success',
      errorMessage: 'Wystąpił błąd podczas operacji',
      onErrorCallback,
    }))

    const success = await result.current.execute(undefined)

    await waitFor(() => {
      expect(success).toBe(false)
      expect(mockToast.error).toHaveBeenCalledWith(
        'Wystąpił błąd podczas operacji',
        { description: 'Test error' }
      )
      expect(onErrorCallback).toHaveBeenCalledWith(error)
    })
  })

  it('powinien invalidować query cache po sukcesie', async () => {
    const mutationFn = vi.fn().mockResolvedValue(undefined)

    const { result, queryClient } = renderHookWithQuery(() => useTypedMutation({
      mutationFn,
      successMessage: 'Success',
      invalidateKeys: [['users'], ['posts']],
    }))

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    await result.current.execute(undefined)

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledTimes(2)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['posts'] })
    })
  })

  it('powinien używać domyślnej wiadomości błędu', async () => {
    const mutationFn = vi.fn().mockRejectedValue(new Error('Test'))

    const { result } = renderHookWithQuery(() => useTypedMutation({
      mutationFn,
      successMessage: 'Success',
    }))

    await result.current.execute(undefined)

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Wystąpił błąd',
        { description: 'Test' }
      )
    })
  })

  it('powinien udostępniać alias loading dla isPending', async () => {
    const mutationFn = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    const { result } = renderHookWithQuery(() => useTypedMutation({
      mutationFn,
      successMessage: 'Success',
    }))

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

    const { result } = renderHookWithQuery(() => 
      useTypedMutation<void, { name: string; age: number }>({
        mutationFn,
        successMessage: 'Success',
      })
    )

    await result.current.execute({ name: 'John', age: 30 })

    // mutationFn otrzymuje dodatkowy context od React Query, sprawdzamy tylko pierwszy argument
    expect(mutationFn).toHaveBeenCalled()
    expect(mutationFn.mock.calls[0][0]).toEqual({ name: 'John', age: 30 })
  })
})
