import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Pencil, RotateCw, Trash2 } from "lucide-react"
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
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">{group.name}</DialogTitle>
          <DialogDescription className="text-[0.9375rem]">
            Utworzona {formatDate(group.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="space-y-3">
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
