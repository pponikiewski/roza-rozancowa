import { useId, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { ConfirmationDialog, useConfirmation } from "@/shared/components/feedback"
import { Collapsible } from "@/shared/components/common/Collapsible"
import { ExpandableText } from "@/shared/components/common/ExpandableText"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"
import { formatDayMonth } from "@/shared/lib/formatters"
import { cn } from "@/shared/lib/utils"
import { getEasterDate } from "@/shared/lib/liturgical"
import type { IndulgenceDay } from "@/features/admin/indulgences/types/indulgence.types"

interface IndulgenceListProps {
  indulgences: IndulgenceDay[]
  loading: boolean
  onEdit: (indulgence: IndulgenceDay) => void
  onDelete: (id: number) => void
}

/** Etykieta daty; dla Wielkanocy data w bieżącym roku */
function getDateLabel(item: IndulgenceDay): string {
  if (item.is_easter) {
    const year = new Date().getFullYear()
    const { month, day } = getEasterDate(year)
    return `Wielkanoc (${year}: ${formatDayMonth(day, month)})`
  }
  return formatDayMonth(item.day!, item.month!)
}

/**
 * Kalendarz odpustów jako zwijana lista w kolejności kalendarza (domyślnie zwinięta)
 */
export function IndulgenceList({ indulgences, loading, onEdit, onDelete }: IndulgenceListProps) {
  const { confirm, dialogProps } = useConfirmation()
  const [open, setOpen] = useState(false)
  const listId = useId()
  const isEmpty = indulgences.length === 0

  const handleDelete = (item: IndulgenceDay) => {
    confirm({
      title: "Usunąć dzień odpustu?",
      description: <>Czy na pewno chcesz usunąć <b>„{item.name}”</b>?</>,
      confirmText: "Usuń",
      variant: "danger",
      onConfirm: () => onDelete(item.id),
    })
  }

  return (
    <>
      <section className="border-t">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          disabled={isEmpty}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>
            <span className="block text-lg font-semibold">Kalendarz odpustów</span>
            <span className="text-sm text-muted-foreground">
              {loading ? "Wczytywanie..." : isEmpty ? "Brak dni odpustów" : `Zapisane dni: ${indulgences.length}`}
            </span>
          </span>
          {!isEmpty && (
            <ChevronDown className={cn("h-5 w-5 flex-shrink-0 text-muted-foreground motion-safe:transition-transform", open && "rotate-180")} />
          )}
        </button>

        <Collapsible open={open} id={listId}>
          <ul className="divide-y border-t">
            {indulgences.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <div className="mb-0.5">
                    <span className="font-semibold">{getDateLabel(item)}</span>
                    <span className="text-sm text-muted-foreground">
                      {", "}{item.is_easter ? "święto ruchome" : item.year === null ? "co roku" : item.year}
                    </span>
                  </div>
                  <div className="text-[0.9375rem]">{item.name}</div>
                  {item.description && (
                    <ExpandableText className="mt-1 text-sm text-muted-foreground">{item.description}</ExpandableText>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)} aria-label={`Edytuj: ${item.name}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(item)}
                    aria-label={`Usuń: ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Collapsible>
      </section>

      <ConfirmationDialog {...dialogProps} />
    </>
  )
}
