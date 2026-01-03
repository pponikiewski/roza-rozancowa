import { useLocation, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { toast } from "sonner"
import { ModeToggle } from "@/components/mode-toggle"
import { SeniorModeToggle } from "@/components/senior-mode-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/context/AuthContext"

interface HeaderControlsProps {
  className?: string
}

export function HeaderControls({ className }: HeaderControlsProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { seniorMode } = useTheme()
  const { signOut } = useAuth()
  const isUltra = seniorMode === "ultra"
  const isLoginPage = location.pathname === "/" || location.pathname === "/login"

  const handleLogout = async () => {
    try {
      await signOut()
      navigate("/login", { replace: true })
    } catch (error) {
      toast.error("Błąd wylogowania")
      // Force navigation even if error
      navigate("/login", { replace: true })
    }
  }

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
