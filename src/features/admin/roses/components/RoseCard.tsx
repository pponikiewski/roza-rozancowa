import { ChevronRight, Rose } from "lucide-react"
import { formatDayMonth } from "@/shared/lib/formatters"
import type { Group } from "@/shared/types/domain.types"

interface RoseCardProps {
  group: Group
  onClick: () => void
}

/**
 * Karta reprezentująca pojedynczą Różę na liście
 */
export function RoseCard({ group, onClick }: RoseCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm hover:bg-accent/50 transition-all cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-2.5 rounded-full text-primary shrink-0">
          <Rose className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-base">{group.name}</span>
          <span className="text-xs text-muted-foreground">
            {group.admission_month && group.admission_day
              ? `Przyjęcie do Stowarzyszenia: ${formatDayMonth(group.admission_day, group.admission_month)}`
              : "Kliknij, aby zarządzać"}
          </span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
    </div>
  )
}
