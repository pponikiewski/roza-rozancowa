import { Outlet, NavLink } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet"
import { Users, HandHeart, LayoutDashboard, Menu, Rose, Timer, CalendarHeart } from "lucide-react"
import { useState } from "react"
import { HeaderControls } from "@/shared/components/common/HeaderControls"
import { useMysteryChangeTimer } from "@/features/user/hooks/useMysteryChangeTimer"
import { ROUTES } from "@/shared/lib/constants"

interface NavContentProps {
  timeLeft: { days: number; hours: number; minutes: number }
  targetDate: Date | null
  onNavClick?: () => void
}

// Komponent renderujący zawartość paska nawigacyjnego (logo, linki, licznik)
function NavContent({ timeLeft, targetDate, onNavClick }: NavContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Admin Panel
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {[
          { to: ROUTES.ADMIN.MEMBERS, icon: Users, label: "Użytkownicy" },
          { to: ROUTES.ADMIN.INTENTIONS, icon: HandHeart, label: "Intencja" },
          { to: ROUTES.ADMIN.ROSES, icon: Rose, label: "Róże" },
          { to: ROUTES.ADMIN.INDULGENCES, icon: CalendarHeart, label: "Odpusty" },
        ].map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[0.9375rem] font-medium ${isActive ? "bg-primary-soft text-primary font-semibold" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t bg-muted/40">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Timer className="h-3.5 w-3.5" />
            <span>Do zmiany tajemnic:</span>
          </div>
          <div className="text-sm font-mono font-semibold tabular-nums pl-5">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </div>
          {targetDate && (
            <div className="text-xs text-muted-foreground pl-5 pt-1">
              {targetDate.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Główny komponent układu panelu administratora, zarządzający stanem nawigacji i licznikiem czasu
export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { timeLeft, targetDate } = useMysteryChangeTimer()

  return (
    <div className="flex h-screen w-full bg-background flex-col md:flex-row">
      <aside className="hidden md:flex w-64 border-r bg-card flex-col">
        <NavContent timeLeft={timeLeft} targetDate={targetDate} />
      </aside>
      <div className="app-header md:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <div className="header-user-info flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent timeLeft={timeLeft} targetDate={targetDate} onNavClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-3">
            <img src="/roseb.svg" alt="Logo" className="h-8 w-8 object-contain" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">Główny Admin</span>
              <span className="text-xs text-muted-foreground font-medium">Panel Zarządzania</span>
            </div>
          </div>
        </div>
        <HeaderControls />
      </div>
      <main className="flex-1 overflow-auto bg-background p-4 md:p-8 relative">
        <div className="hidden md:flex absolute top-4 right-4 z-10">
          <HeaderControls />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
