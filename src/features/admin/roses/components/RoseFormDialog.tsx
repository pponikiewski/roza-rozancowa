import { FormDialog } from "@/shared/components/feedback"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edytuj Różę" : "Utwórz Nową Różę"}
      description={isEditing ? "Zmień nazwę istniejącej grupy." : "Dodaj nową grupę modlitewną."}
      onSubmit={onSubmit}
      loading={loading}
    >
      <div className="space-y-2">
        <Label>Nazwa Róży</Label>
        <Input
          placeholder="np. Róża pw. Św. Rity"
          value={groupName}
          onChange={(e) => onGroupNameChange(e.target.value)}
          autoFocus
        />
      </div>
    </FormDialog>
  )
}
