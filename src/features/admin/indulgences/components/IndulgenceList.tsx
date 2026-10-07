import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { ConfirmationDialog, useConfirmation } from "@/shared/components/feedback"
import { CalendarDays, Pencil, Trash2 } from "lucide-react"
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
      description: <>Czy na pewno chcesz usunąć <b>"{item.name}"</b>?</>,
      confirmText: "Usuń",
      variant: "danger",
      onConfirm: () => onDelete(item.id),
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-full">
              <CalendarDays className="h-5 w-5" />
            </div>
            <CardTitle>Kalendarz odpustów</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {indulgences.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold">{getDateLabel(item)}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.is_easter ? "święto ruchome" : item.year === null ? "co roku" : item.year}
                    </Badge>
                  </div>
                  <div className="text-sm">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</div>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)} title="Edytuj">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(item)}
                    title="Usuń"
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
        </CardContent>
      </Card>

      <ConfirmationDialog {...dialogProps} />
    </>
  )
}
