import { Button } from "@/shared/components/ui/button"
import { ConfirmationDialog, useConfirmation } from "@/shared/components/feedback"
import { Pencil, Trash2 } from "lucide-react"
import { formatDayMonth } from "@/shared/lib/formatters"
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
 * Lista dni odpustów w kolejności kalendarza
 */
export function IndulgenceList({ indulgences, loading, onEdit, onDelete }: IndulgenceListProps) {
  const { confirm, dialogProps } = useConfirmation()

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
      <section className="border-t pt-6">
        <h2 className="text-lg font-semibold">Kalendarz odpustów</h2>
        <ul className="mt-2 divide-y">
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
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</div>
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
          {!loading && indulgences.length === 0 && (
            <li className="text-center text-sm text-muted-foreground py-6">
              Brak dni odpustów
            </li>
          )}
        </ul>
      </section>

      <ConfirmationDialog {...dialogProps} />
    </>
  )
}
