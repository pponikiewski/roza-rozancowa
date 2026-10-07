/**
 * Daty liturgiczne
 * (ta sama logika w supabase/functions/send-push — przy zmianie zaktualizuj oba miejsca)
 */

/**
 * Data Wielkanocy w kalendarzu gregoriańskim (algorytm Meeusa/Jonesa/Butchera)
 * @returns miesiąc (1-12) i dzień
 */
export function getEasterDate(year: number): { month: number; day: number } {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { month, day }
}

/**
 * Czy podana data to Wielkanoc
 */
export function isEaster(date: Date): boolean {
  const { month, day } = getEasterDate(date.getFullYear())
  return date.getMonth() + 1 === month && date.getDate() === day
}
