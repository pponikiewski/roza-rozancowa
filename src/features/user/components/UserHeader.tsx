import { Users } from "lucide-react"
import { HeaderControls } from "@/shared/components/common/HeaderControls"
import type { Profile } from "@/shared/types/domain.types"

interface UserHeaderProps {
  profile: Profile | null
  onOpenRose: () => void
}

/**
 * Header panelu użytkownika z informacjami o profilu i kontrolkami
 */
export function UserHeader({ profile, onOpenRose }: UserHeaderProps) {
  return (
    <header className="app-header sticky top-0 z-10 bg-card/90 backdrop-blur-md border-b px-4 py-3 flex items-center gap-2">
      <div
        className="header-user-info flex items-center gap-3 cursor-pointer p-1.5 -ml-1.5 rounded-lg hover:bg-accent transition-colors group select-none min-w-0 flex-1"
        onClick={onOpenRose}
        title="Kliknij, aby zobaczyć swoją Różę"
      >
        <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-primary-soft ring-1 ring-primary/20 group-hover:ring-primary/50 transition-shadow flex-shrink-0">
          <img src="/roseb.svg" alt="Logo" className="h-6 w-6 object-contain" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-base font-semibold leading-tight truncate">
            {profile?.full_name}
          </span>
          <span className="text-sm text-muted-foreground leading-tight mt-0.5 flex items-center gap-1.5 group-hover:text-foreground transition-colors min-w-0">
            <Users className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{profile?.groups?.name || "Brak grupy"}</span>
          </span>
        </div>
      </div>
      <HeaderControls className="flex-shrink-0" />
    </header>
  )
}
