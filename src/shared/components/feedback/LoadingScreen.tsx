import { Loader2 } from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface LoadingScreenProps {
  /** Tekst wyświetlany pod spinnerem */
  text?: string
  /** Czy zajmuje całą wysokość ekranu */
  fullScreen?: boolean
  /** Dodatkowe klasy CSS */
  className?: string
  /** Rozmiar spinnera */
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
}

/**
 * Wspólny komponent ekranu ładowania
 * 
 * @example
 * // Pełnoekranowy (np. w AuthProvider)
 * <LoadingScreen fullScreen text="Ładowanie..." />
 * 
 * @example
 * // W kontenerze
 * <LoadingScreen size="sm" />
 */
export function LoadingScreen({
  text,
  fullScreen = false,
  className,
  size = "md",
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen && "h-screen w-full",
        !fullScreen && "p-8",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className={cn(
            "animate-spin text-primary",
            sizeClasses[size]
          )}
        />
        {text && (
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}
