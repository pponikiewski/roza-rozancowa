import { useLocation, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ModeToggle } from "@/components/mode-toggle"
import { SeniorModeToggle } from "@/components/senior-mode-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

interface HeaderControlsProps {
  className?: string
}

export function HeaderControls({ className }: HeaderControlsProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { seniorMode } = useTheme()
  const isUltra = seniorMode === "ultra"
  const isLoginPage = location.pathname === "/" || location.pathname === "/login"

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
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
