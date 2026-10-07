import { cn } from "@/shared/lib/utils"

interface AckStatusProps {
  acknowledged: boolean
  className?: string
}

/**
 * Status zapoznania się z tajemnicą w bieżącym miesiącu, jako krótki tekst w kolorze
 */
export function AckStatus({ acknowledged, className }: AckStatusProps) {
  return (
    <span className={cn("text-sm", acknowledged ? "font-medium text-success" : "text-muted-foreground", className)}>
      {acknowledged ? "Potwierdził(a)" : "Czeka"}
    </span>
  )
}
