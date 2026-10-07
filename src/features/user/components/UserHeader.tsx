import { ChevronRight } from "lucide-react"
import type { Profile } from "@/shared/types/domain.types"

interface UserHeaderProps {
  profile: Profile | null
  onOpenRose: () => void
}

/**
 * Header panelu użytkownika. Kliknięcie otwiera panel konta:
 * zmiana hasła, wylogowanie, wygląd i skład Róży
 */
export function UserHeader({ profile, onOpenRose }: UserHeaderProps) {
  return (
    <header className="app-header sticky top-0 z-10 bg-card/90 backdrop-blur-md border-b px-4 py-3 flex items-center">
      <button
        type="button"
        className="header-user-info flex items-center gap-3 p-1.5 -ml-1.5 rounded-lg text-left hover:bg-accent transition-colors min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onOpenRose}
        aria-label={`${profile?.full_name ?? ""}. Konto, wygląd i skład Róży ${profile?.groups?.name ?? ""}`.trim()}
      >
        <img src="/roseb.svg" alt="" className="h-10 w-10 object-contain flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-base font-semibold leading-tight truncate">
            {profile?.full_name}
          </span>
          <span className="text-sm font-medium text-primary leading-tight mt-0.5 flex items-center gap-0.5 min-w-0">
            <span className="truncate">{profile?.groups?.name || "Brak grupy"}</span>
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          </span>
        </div>
      </button>
    </header>
  )
}
