import { Outlet, NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Users, HandHeart, LayoutDashboard, Menu, Rose, Timer } from "lucide-react"
import { useState, useEffect } from "react"

// Główny komponent układu panelu administratora, zarządzający stanem nawigacji i licznikiem czasu
export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [targetDate, setTargetDate] = useState<Date | null>(null)

  // Oblicza datę zmiany tajemnic (pierwsza niedziela miesiąca) i aktualizuje odliczanie
  useEffect(() => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const daysUntilSunday = (7 - nextMonth.getDay()) % 7
    nextMonth.setDate(nextMonth.getDate() + daysUntilSunday)
    nextMonth.setHours(0, 0, 0, 0)
    setTargetDate(nextMonth)

    const timer = setInterval(() => {
      const diff = nextMonth.getTime() - new Date().getTime()
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        })
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Komponent renderujący zawartość paska nawigacyjnego (logo, linki, licznik)
  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Admin Panel
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {[
          { to: "/admin/members", icon: Users, label: "Użytkownicy" },
          { to: "/admin/intentions", icon: HandHeart, label: "Intencja" },
          { to: "/admin/groups", icon: Rose, label: "Róże" },
        ].map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t bg-muted/20">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Timer className="h-3.5 w-3.5" />
            <span>Do zmiany tajemnic:</span>
          </div>
          <div className="text-sm font-mono font-semibold tabular-nums pl-5">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </div>
          {targetDate && (
            <div className="text-[10px] text-muted-foreground pl-5 pt-1">
              {targetDate.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-background flex-col md:flex-row">
      <aside className="hidden md:flex w-64 border-r bg-card flex-col">
        <NavContent />
      </aside>
      <div className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-3">
          <img src="/rose.svg" alt="Logo" className="h-8 w-8 object-contain" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">Główny Admin</span>
            <span className="text-[10px] text-muted-foreground font-medium">Panel Zarządzania</span>
          </div>
        </div>
      </div>
      <main className="flex-1 overflow-auto bg-muted/10 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
