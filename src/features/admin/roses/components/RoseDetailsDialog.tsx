import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Separator } from "@/shared/components/ui/separator"
import { CalendarClock, Pencil, Rose, RotateCw, Trash2 } from "lucide-react"
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="bg-primary/10 p-2 rounded-full text-primary">
              <Rose className="h-5 w-5" />
            </div>
            {group.name}
          </DialogTitle>
          <DialogDescription>Szczegóły i zarządzanie Różą.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="bg-muted/30 p-3 rounded-lg border flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Data utworzenia
              </span>
              <span className="text-sm font-medium">
                {formatDate(group.created_at)}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Dostępne akcje
            </h4>
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="justify-start h-11"
                onClick={() => handleAction(onRotate)}
              >
                <RotateCw className="mr-2 h-4 w-4 text-primary" />
                Wymuś rotację tajemnic
              </Button>
              <Button
                variant="outline"
                className="justify-start h-11"
                onClick={() => handleAction(onEdit)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edytuj nazwę
              </Button>
              <Button
                variant="destructive"
                className="justify-start h-11"
                onClick={() => handleAction(onDelete)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Usuń Różę
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
