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

/**
 * Optymalizuje URL obrazka z Supabase używając Image Transformations
 * Zamienia endpoint /object/ na /render/image/ i dodaje parametry
 */
export function getOptimizedImageUrl(url: string, width: number = 800): string {
  if (!url || !url.includes('supabase.co')) return url;
  
  // Jeśli URL wskazuje na standardowy endpoint storage, spróbuj zamienić na render/image
  if (url.includes('/storage/v1/object/public/')) {
    // Sprawdź czy to jest webp - jeśli tak, zwróć normalny URL bo webp już jest zoptymalizowany
    if (url.endsWith('.webp')) {
      return url;
    }
    const optimizedUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${optimizedUrl}?width=${width}&resize=contain&quality=80`;
  }
  
  return url;
}
