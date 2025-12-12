import { Glasses } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function SeniorModeToggle() {
  const { seniorMode, toggleSeniorMode } = useTheme()

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
      size="icon"
      onClick={toggleSeniorMode}
      className={cn(
        "transition-all",
        seniorMode !== "normal" && "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
      title={getTitle()}
    >
      <Glasses className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Przełącz tryb seniora</span>
    </Button>
  )
}
