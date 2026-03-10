/**
 * Testy useTypedMutation - hook mutacji (1 kluczowy test)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderHookWithQuery, clearAllMocks } from '@tests/utils'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/shared/lib/utils', () => ({
  getErrorMessage: (error: Error) => error.message,
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

import { useTypedMutation } from '@/shared/hooks/useTypedMutation'
import { toast } from 'sonner'

describe('useTypedMutation', () => {
  beforeEach(() => clearAllMocks())

  it('wykonuje mutację z sukcesem i wyświetla toast', async () => {
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
      expect(vi.mocked(toast).success).toHaveBeenCalledWith('Operacja zakończona sukcesem')
      expect(onSuccessCallback).toHaveBeenCalledWith({ id: 1 })
    })
  })
})
