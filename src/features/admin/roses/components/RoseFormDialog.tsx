import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Loader2 } from "lucide-react"
import type { Group } from "@/shared/types/domain.types"

interface RoseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingGroup: Group | null
  groupName: string
  onGroupNameChange: (name: string) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

/**
 * Dialog do tworzenia/edycji Róży
 */
export function RoseFormDialog({
  open,
  onOpenChange,
  editingGroup,
  groupName,
  onGroupNameChange,
  onSubmit,
  loading,
}: RoseFormDialogProps) {
  const isEditing = !!editingGroup

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edytuj Różę" : "Utwórz Nową Różę"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Zmień nazwę istniejącej grupy."
              : "Dodaj nową grupę modlitewną."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nazwa Róży</Label>
            <Input
              placeholder="np. Róża pw. Św. Rity"
              value={groupName}
              onChange={(e) => onGroupNameChange(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
