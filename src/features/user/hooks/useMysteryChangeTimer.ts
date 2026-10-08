import { useState, useEffect } from "react"

const MINUTE_MS = 60_000

/** Pierwsza niedziela miesiąca, północ */
function findFirstSunday(year: number, month: number): Date {
  const first = new Date(year, month, 1)
  const daysUntilSunday = (7 - first.getDay()) % 7
  first.setDate(first.getDate() + daysUntilSunday)
  first.setHours(0, 0, 0, 0)
  return first
}

/** Najbliższa zmiana tajemnic (1. niedziela miesiąca) i czas do niej */
function calculate() {
  const now = new Date()
  const thisMonthSunday = findFirstSunday(now.getFullYear(), now.getMonth())
  const targetDate = thisMonthSunday.getTime() > now.getTime()
    ? thisMonthSunday
    : findFirstSunday(now.getFullYear(), now.getMonth() + 1)

  const difference = Math.max(0, targetDate.getTime() - now.getTime())
  return {
    targetDate,
    timeLeft: {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
    },
  }
}

/**
 * Czas do zmiany tajemnic, odświeżany co minutę.
 * Używać w komponencie, który go wyświetla — co minutę renderuje się tylko on, a nie cała strona.
 */
export function useMysteryChangeTimer() {
  const [state, setState] = useState(calculate)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    // Odświeżenie na początku pełnej minuty — licznik zmienia się razem z zegarem telefonu
    const schedule = () => {
      timer = setTimeout(tick, MINUTE_MS - (Date.now() % MINUTE_MS))
    }
    const tick = () => {
      setState(calculate())
      schedule()
    }

    // W tle (zwłaszcza na iPhonie) timery stoją — po powrocie do aplikacji licznik od razu aktualny
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return
      clearTimeout(timer)
      tick()
    }

    schedule()
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  return state
}
