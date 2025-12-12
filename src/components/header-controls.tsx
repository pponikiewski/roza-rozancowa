import { useLocation, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ModeToggle } from "@/components/mode-toggle"
import { SeniorModeToggle } from "@/components/senior-mode-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeaderControlsProps {
  className?: string
}

export function HeaderControls({ className }: HeaderControlsProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isLoginPage = location.pathname === "/" || location.pathname === "/login"

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <SeniorModeToggle />
      <ModeToggle />
      {!isLoginPage && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleLogout} 
          title="Wyloguj się"
          className="bg-background/80 backdrop-blur-sm border-border shadow-sm hover:bg-destructive hover:text-white transition-colors"
        >
          <LogOut className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Wyloguj</span>
        </Button>
      )}
    </div>
  )
}
