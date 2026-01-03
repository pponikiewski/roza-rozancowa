import { Glasses } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useTheme } from "@/shared/context/ThemeContext"
import { cn } from "@/shared/lib/utils"

export function SeniorModeToggle({ className }: { className?: string }) {
  const { seniorMode, toggleSeniorMode } = useTheme()
  const isUltra = seniorMode === "ultra"

  const getTitle = () => {
    switch (seniorMode) {
      case "normal":
        return "Włącz tryb seniora"
      case "senior":
        return "Włącz tryb wysokiego kontrastu"
      case "ultra":
        return "Wyłącz tryb seniora"
    }
  }

  return (
    <Button
      variant="outline"
      size={isUltra ? "default" : "icon"}
      onClick={toggleSeniorMode}
      className={cn(
        "transition-all",
        seniorMode !== "normal" && "bg-primary text-primary-foreground hover:bg-primary/90",
        isUltra && "px-4 gap-2 font-bold",
        className
      )}
      title={getTitle()}
    >
      <Glasses className="h-[1.2rem] w-[1.2rem]" />
      {isUltra && <span>Tryb</span>}
      <span className="sr-only">Przełącz tryb seniora</span>
    </Button>
  )
}
