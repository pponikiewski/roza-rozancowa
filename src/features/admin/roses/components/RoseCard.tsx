import { ChevronRight } from "lucide-react"
import { formatDayMonth } from "@/shared/lib/formatters"
import type { Group } from "@/shared/types/domain.types"

interface RoseCardProps {
  group: Group
  onClick: () => void
}

/**
 * Wiersz z pojedynczą Różą na liście
 */
export function RoseCard({ group, onClick }: RoseCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 py-3.5 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-base font-semibold">{group.name}</span>
        {group.admission_month && group.admission_day && (
          <span className="text-sm text-muted-foreground">
            Przyjęcie do Stowarzyszenia: {formatDayMonth(group.admission_day, group.admission_month)}
          </span>
        )}
      </div>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
    </button>
  )
}
