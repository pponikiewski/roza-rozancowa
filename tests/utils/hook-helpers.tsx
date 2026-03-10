import { vi } from 'vitest'

export function setupTimers() {
  vi.useFakeTimers()
}

export function cleanupTimers() {
  vi.useRealTimers()
}
