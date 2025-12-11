import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Funkcja pomocnicza do łączenia klas CSS (Tailwind) z obsługą warunków i konfliktów
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Bezpiecznie wyciąga wiadomość z obiektu błędu
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as any).message)
  }
  return "Wystąpił nieznany błąd"
}
