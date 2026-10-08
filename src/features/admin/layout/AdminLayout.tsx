import { Outlet, NavLink } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet"
import { Menu, ChevronUp, LogOut } from "lucide-react"
import { useId, useState } from "react"
import { cn } from "@/shared/lib/utils"
import { AppearanceSettings } from "@/shared/components/common/AppearanceSettings"
import { Collapsible } from "@/shared/components/common/Collapsible"
import { useMysteryChangeTimer } from "@/features/user/hooks/useMysteryChangeTimer"
import { useLogout } from "@/features/auth"
import { useStatusBarColor } from "@/shared/hooks/useStatusBarColor"
import { ROUTES } from "@/shared/lib/constants"
import { formatTimeLeft } from "@/shared/lib/formatters"

interface NavContentProps {
  timeLeft: { days: number; hours: number; minutes: number }
  targetDate: Date | null
  onNavClick?: () => void
}

// Zawartość menu: nazwa panelu, linki, licznik do zmiany tajemnic
// i ustawienia (wygląd, wylogowanie) rozwijane w górę na dole menu
function NavContent({ timeLeft, targetDate, onNavClick }: NavContentProps) {
  const handleLogout = useLogout()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsId = useId()

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center gap-3 border-b px-5 py-5">
        <img src="/logo-128.webp" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
        <span className="text-base font-semibold leading-tight">Panel administratora</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {[
          { to: ROUTES.ADMIN.MEMBERS, label: "Użytkownicy" },
          { to: ROUTES.ADMIN.INTENTIONS, label: "Intencja" },
          { to: ROUTES.ADMIN.ROSES, label: "Róże" },
          { to: ROUTES.ADMIN.INDULGENCES, label: "Odpusty" },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[0.9375rem] font-medium ${isActive ? "bg-primary-soft text-primary font-semibold" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t px-5 py-3 text-sm">
        <p className="text-muted-foreground">
          Zmiana tajemnic
          {targetDate && ` ${targetDate.toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}`}
        </p>
        <p className="font-medium tabular-nums">za {formatTimeLeft(timeLeft)}</p>
      </div>

      <div className="border-t p-3">
        {/* Ustawienia rozwijane w górę, wewnątrz menu */}
        <Collapsible open={settingsOpen} id={settingsId}>
          <div className="space-y-4 px-2 pb-4 pt-2">
            <AppearanceSettings />
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Wyloguj się
            </Button>
          </div>
        </Collapsible>
        {/* Ten sam wygląd co pozycje menu powyżej */}
        <button
          type="button"
          aria-expanded={settingsOpen}
          aria-controls={settingsId}
          onClick={() => setSettingsOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[0.9375rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            settingsOpen ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <span className="flex-1 text-left">Ustawienia</span>
          <ChevronUp className={cn("h-4 w-4 motion-safe:transition-transform", !settingsOpen && "rotate-180")} />
        </button>
      </div>
    </div>
  )
}

// Układ panelu administratora: menu boczne na komputerze, wysuwane menu na telefonie
export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { timeLeft, targetDate } = useMysteryChangeTimer()
  const handleLogout = useLogout()
  useStatusBarColor("card")

  return (
    <div className="flex h-screen w-full bg-background flex-col md:flex-row">
      <aside className="hidden md:flex w-72 border-r bg-card flex-col">
        <NavContent timeLeft={timeLeft} targetDate={targetDate} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Pasek górny: na telefonie menu i tytuł, na komputerze tylko wylogowanie (w prawym górnym rogu) */}
        <header className="app-header sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 md:px-8 md:py-[1.125rem] flex items-center gap-2">
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2" aria-label="Otwórz menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="p-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] w-72"
                // Fokus na menu, a nie na krzyżyk zamykania
                onOpenAutoFocus={(e) => {
                  e.preventDefault()
                  ;(e.currentTarget as HTMLElement).focus()
                }}
              >
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <NavContent timeLeft={timeLeft} targetDate={targetDate} onNavClick={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <img src="/logo-128.webp" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="truncate text-base font-semibold">Panel administratora</span>
          </div>
          <div className="header-controls ml-auto flex flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
              <LogOut className="h-4 w-4" />
              Wyloguj
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
