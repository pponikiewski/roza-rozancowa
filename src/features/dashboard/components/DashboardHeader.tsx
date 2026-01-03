import { Users } from "lucide-react"
import { HeaderControls } from "@/shared/components/common/HeaderControls"
import type { Profile } from "@/shared/types/domain.types"

interface DashboardHeaderProps {
  profile: Profile | null
  onOpenRose: () => void
}

/**
 * Header panelu użytkownika z informacjami o profilu i kontrolkami
 */
export function DashboardHeader({ profile, onOpenRose }: DashboardHeaderProps) {
  return (
    <header className="app-header sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-2 shadow-sm">
      <div
        className="header-user-info flex items-center gap-3 cursor-pointer p-1.5 -ml-1.5 rounded-lg hover:bg-muted/60 transition-colors group select-none min-w-0 flex-1"
        onClick={onOpenRose}
        title="Kliknij, aby zobaczyć swoją Różę"
      >
        <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/10 group-hover:border-primary/40 transition-colors flex items-center justify-center bg-primary/5 flex-shrink-0">
          <img src="/roseb.svg" alt="Logo" className="h-6 w-6 object-contain" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold leading-none flex items-center gap-1.5 truncate">
            <span className="truncate">{profile?.full_name}</span>
            <Users className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 font-medium group-hover:text-foreground transition-colors truncate">
            {profile?.groups?.name || "Brak grupy"}
          </span>
        </div>
      </div>
      <HeaderControls className="flex-shrink-0" />
    </header>
  )
}
