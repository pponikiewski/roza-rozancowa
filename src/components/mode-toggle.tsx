import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

// Komponent przycisku do przełączania motywu aplikacji (jasny/ciemny)
export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme, seniorMode } = useTheme()
  const isUltra = seniorMode === "ultra"

  // Funkcja zmieniająca motyw na przeciwny do obecnego
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (isUltra) {
    return (
      <Button 
        variant="outline" 
        onClick={toggleTheme}
        className={cn("px-4 gap-2 font-bold", className)}
      >
        {theme === "dark" ? (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        )}
        <span className="ml-2">Kolor</span>
        <span className="sr-only">Przełącz motyw</span>
      </Button>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className={className}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Przełącz motyw</span>
    </Button>
  )
}