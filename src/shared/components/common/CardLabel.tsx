import { cn } from "@/shared/lib/utils"

interface CardLabelProps {
  children: React.ReactNode
  className?: string
}

/**
 * Krótki nagłówek sekcji na stronie użytkownika (intencja, odpust, powiadomienia)
 */
export function CardLabel({ children, className }: CardLabelProps) {
  return <p className={cn("text-sm font-medium text-muted-foreground", className)}>{children}</p>
}
