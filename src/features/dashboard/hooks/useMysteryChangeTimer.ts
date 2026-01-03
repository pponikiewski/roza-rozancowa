import { useState, useEffect } from "react"

export function useMysteryChangeTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const [targetDate, setTargetDate] = useState<Date | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      // First day of next month
      let nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      // Find first Sunday
      let dayOfWeek = nextMonth.getDay()
      let daysUntilSunday = (7 - dayOfWeek) % 7 
      nextMonth.setDate(nextMonth.getDate() + daysUntilSunday)
      nextMonth.setHours(0, 0, 0, 0) 
      
      setTargetDate(nextMonth)

      const difference = nextMonth.getTime() - now.getTime()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        })
      }
    }
    calculateTimeLeft()
    // Aktualizacja co minutę zamiast co sekundę - zmniejsza liczbę re-renderów
    const timer = setInterval(calculateTimeLeft, 60000)
    return () => clearInterval(timer)
  }, [])

  return { timeLeft, targetDate }
}
