import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Funkcja pomocnicza do łączenia klas CSS (Tailwind) z obsługą warunków i konfliktów
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Rzuca błąd jeśli odpowiedź Edge Function zawiera błąd
 */
export function throwOnFunctionError(
  error: { message?: string } | null,
  data?: { error?: string },
  fallback?: string
): void {
  if (error || data?.error)
    throw new Error(error?.message || data?.error || fallback)
}

/**
 * Bezpiecznie wyciąga wiadomość z obiektu błędu
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return "Wystąpił nieznany błąd"
}

/**
 * Optymalizuje URL obrazka z Supabase używając Image Transformations
 * Zamienia endpoint /object/ na /render/image/ i dodaje parametry
 */
export function getOptimizedImageUrl(url: string, _width: number = 800): string {
  return url;
}
