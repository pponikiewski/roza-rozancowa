import { useMysteryChangeTimer } from "@/features/user/hooks/useMysteryChangeTimer"
import { formatTimeLeft } from "@/shared/lib/formatters"

/**
 * Czas do zmiany tajemnic. Osobny komponent: odświeżanie co minutę renderuje tylko ten napis
 */
export function MysteryChangeCountdown() {
  const { timeLeft } = useMysteryChangeTimer()

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      <span>Do zmiany tajemnic:</span>
      <span className="font-semibold tabular-nums text-foreground">
        {formatTimeLeft(timeLeft)}
      </span>
    </div>
  )
}
