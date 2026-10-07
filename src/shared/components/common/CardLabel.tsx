import type { LucideIcon } from "lucide-react"
import { cn } from "@/shared/lib/utils"

type CardLabelTone = "primary" | "warning" | "success" | "muted"

interface CardLabelProps {
  icon: LucideIcon
  children: React.ReactNode
  tone?: CardLabelTone
  className?: string
}

const toneClasses: Record<CardLabelTone, { icon: string; text: string }> = {
  primary: { icon: "bg-primary-soft text-primary", text: "text-primary" },
  warning: { icon: "bg-warning/15 text-warning", text: "text-warning" },
  success: { icon: "bg-success-soft text-success", text: "text-success" },
  muted: { icon: "bg-muted text-muted-foreground", text: "text-muted-foreground" },
}

/**
 * Nagłówek karty: ikona w kółku + etykieta wersalikami.
 * Wspólny wzorzec dla kart na stronie użytkownika (intencja, odpust, powiadomienia)
 */
export function CardLabel({ icon: Icon, children, tone = "primary", className }: CardLabelProps) {
  const classes = toneClasses[tone]

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full", classes.icon)}>
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn("text-xs font-semibold uppercase tracking-wider", classes.text)}>
        {children}
      </span>
    </div>
  )
}
