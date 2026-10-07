import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { formatDayMonth } from "@/shared/lib/formatters"
import type { Group } from "@/shared/types/domain.types"

interface RoseDetailsDialogProps {
  group: Group | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRotate: (group: Group) => void
  onEdit: (group: Group) => void
  onDelete: (group: Group) => void
}

/**
 * Dialog ze szczegółami i akcjami dla wybranej Róży
 */
export function RoseDetailsDialog({
  group,
  open,
  onOpenChange,
  onRotate,
  onEdit,
  onDelete,
}: RoseDetailsDialogProps) {
  if (!group) return null

  const handleAction = (action: (group: Group) => void) => {
    onOpenChange(false)
    action(group)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Brak danych"
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        // Fokus na okno, a nie na pierwszy przycisk - inaczej wygląda na zaznaczony
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).focus()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">{group.name}</DialogTitle>
          <DialogDescription className="sr-only">Dane Róży i dostępne akcje</DialogDescription>
        </DialogHeader>

        <dl className="divide-y border-y">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-sm text-muted-foreground">Utworzona</dt>
            <dd className="text-[0.9375rem]">{formatDate(group.created_at)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-sm text-muted-foreground">Przyjęcie do Stowarzyszenia</dt>
            <dd className="text-right text-[0.9375rem]">
              {group.admission_day && group.admission_month
                ? formatDayMonth(group.admission_day, group.admission_month)
                : <span className="text-muted-foreground">nie ustawiono</span>}
            </dd>
          </div>
        </dl>

        <div className="grid gap-2">
          <Button variant="outline" onClick={() => handleAction(onEdit)}>
            Edytuj dane
          </Button>
          <Button variant="outline" onClick={() => handleAction(onRotate)}>
            Wymuś rotację tajemnic
          </Button>
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button variant="destructive" onClick={() => handleAction(onDelete)}>
            Usuń Różę
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
