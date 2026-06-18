import { useState, useEffect } from "react"

export function useMysteryChangeTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const [targetDate, setTargetDate] = useState<Date | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()

      const findFirstSunday = (year: number, month: number): Date => {
        const first = new Date(year, month, 1)
        const daysUntilSunday = (7 - first.getDay()) % 7
        first.setDate(first.getDate() + daysUntilSunday)
        first.setHours(0, 0, 0, 0)
        return first
      }

      const thisMonthSunday = findFirstSunday(now.getFullYear(), now.getMonth())
      const target = thisMonthSunday.getTime() > now.getTime()
        ? thisMonthSunday
        : findFirstSunday(now.getFullYear(), now.getMonth() + 1)

      setTargetDate(target)

      const difference = target.getTime() - now.getTime()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 })
      }
    }
    calculateTimeLeft()
    // Aktualizacja co minutę zamiast co sekundę - zmniejsza liczbę re-renderów
    const timer = setInterval(calculateTimeLeft, 60000)
    return () => clearInterval(timer)
  }, [])

  return { timeLeft, targetDate }
}
