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
 * Zwraca aktualny rok
 */
export function getCurrentYear(): number {
  return new Date().getFullYear()
}

/**
 * Formatery dat do różnych zastosowań
 */
export const dateFormatters = {
  /**
   * Pełna data z godziną: "3 stycznia, 14:30"
   */
  fullDateTime: (date: string | Date): string =>
    new Date(date).toLocaleString('pl-PL', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }),

  /**
   * Sama data: "03.01.2026"
   */
  date: (date: string | Date): string =>
    new Date(date).toLocaleDateString('pl-PL'),

  /**
   * Pełna data słownie: "3 stycznia 2026"
   */
  fullDate: (date: string | Date): string =>
    new Date(date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),

  /**
   * Miesiąc i rok: "styczeń 2026"
   */
  monthYear: (month: number, year: number): string =>
    `${getMonthName(month)} ${year}`,
}
