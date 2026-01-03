import { useLocation } from "react-router-dom"
import { LogOut } from "lucide-react"
import { ModeToggle } from "@/shared/components/common/ModeToggle"
import { SeniorModeToggle } from "@/shared/components/common/SeniorModeToggle"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { useTheme } from "@/shared/context/ThemeContext"
import { useLogout } from "@/features/auth"

interface HeaderControlsProps {
  className?: string
}

export function HeaderControls({ className }: HeaderControlsProps) {
  const location = useLocation()
  const { seniorMode } = useTheme()
  const handleLogout = useLogout()
  const isUltra = seniorMode === "ultra"
  const isLoginPage = location.pathname === "/" || location.pathname === "/login"

  return (
    <div className={cn("header-controls flex items-center gap-2", className)}>
      <SeniorModeToggle className={isUltra ? "flex-1" : ""} />
      <ModeToggle className={isUltra ? "flex-1" : ""} />
      {!isLoginPage && (
        <Button
          variant="outline"
          size={isUltra ? "default" : "icon"}
          onClick={handleLogout}
          title="Wyloguj się"
          className={cn(
            "bg-background/80 backdrop-blur-sm border-border shadow-sm hover:bg-destructive hover:text-white transition-colors",
            isUltra && "px-4 gap-2 font-bold flex-1"
          )}
        >
          <LogOut className="h-[1.2rem] w-[1.2rem]" />
          {isUltra && <span>Wyloguj</span>}
          <span className="sr-only">Wyloguj</span>
        </Button>
      )}
    </div>
  )
}
