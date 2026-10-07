/**
 * Formatery dat i czasu dla aplikacji
 * Centralizuje logikę formatowania eliminując duplikację
 */

/**
 * Zwraca nazwę miesiąca po polsku
 * @param month - numer miesiąca (1-12)
 */
export function getMonthName(month: number): string {
  return new Date(0, month - 1).toLocaleString('pl-PL', { month: 'long' })
}

/**
 * Zwraca nazwę aktualnego miesiąca po polsku
 */
export function getCurrentMonthName(): string {
  return new Date().toLocaleString('pl-PL', { month: 'long' })
}

/**
 * Zwraca dzień i miesiąc po polsku, np. "7 października"
 * (rok przestępny, żeby 29 lutego się nie przesunął)
 */
export function formatDayMonth(day: number, month: number): string {
  return new Date(2000, month - 1, day).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })
}

/**
 * Zwraca aktualny rok
 */
export function getCurrentYear(): number {
  return new Date().getFullYear()
}


