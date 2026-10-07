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
 * Zwraca czas do zmiany tajemnic po polsku, np. "12 dni 5 godz. 41 min"
 * (dni pomijane, gdy zostało mniej niż doba)
 */
export function formatTimeLeft({ days, hours, minutes }: { days: number; hours: number; minutes: number }): string {
  const parts = [`${hours} godz.`, `${minutes} min`]
  if (days > 0) parts.unshift(`${days} ${days === 1 ? 'dzień' : 'dni'}`)
  return parts.join(' ')
}

/**
 * Zwraca aktualny rok
 */
export function getCurrentYear(): number {
  return new Date().getFullYear()
}


