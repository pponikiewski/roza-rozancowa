/**
 * Setup dla środowiska testowego
 * 
 * Ten plik jest automatycznie ładowany przed uruchomieniem testów (vite.config.ts)
 * 
 * Zawiera:
 * - Import rozszerzeń @testing-library/jest-dom (toBeInTheDocument, toHaveClass, itp.)
 * - Automatyczne czyszczenie DOM po każdym teście
 * - Mock API przeglądarki (matchMedia, IntersectionObserver, ResizeObserver)
 */

import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * Automatyczne czyszczenie DOM po każdym teście
 * Zapewnia izolację testów - każdy test ma czysty stan
 */
afterEach(() => {
  cleanup()
})

/**
 * Mock window.matchMedia
 * Potrzebny dla ThemeContext (dark mode detection)
 * 
 * Domyślnie zwraca matches: false (light mode)
 * Mockuje wszystkie metody API matchMedia
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

/**
 * Mock IntersectionObserver
 * Potrzebny dla komponentów z lazy loading lub scroll detection
 * 
 * Pusta implementacja - komponenty myślą że są zawsze widoczne
 */
globalThis.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return [] }
  unobserve() {}
} as any

/**
 * Mock ResizeObserver
 * Potrzebny dla komponentów reagujących na zmianę rozmiaru (np. wykresy)
 * 
 * Pusta implementacja - brak callbacków przy zmianie rozmiaru
 */
globalThis.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

