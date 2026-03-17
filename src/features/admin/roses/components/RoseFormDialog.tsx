import { useState, useEffect } from "react"
import { FormDialog } from "@/shared/components/feedback"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import type { Group } from "@/shared/types/domain.types"

interface RoseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingGroup: Group | null
  onSubmit: (name: string) => Promise<boolean>
  loading: boolean
}

/**
 * Dialog do tworzenia/edycji Róży
 */
export function RoseFormDialog({
  open,
  onOpenChange,
  editingGroup,
  onSubmit,
  loading,
}: RoseFormDialogProps) {
  const [groupName, setGroupName] = useState("")
  const isEditing = !!editingGroup

  // Wypełnij pole nazwą gdy otwieramy dialog edycji
  useEffect(() => {
    if (open) {
      setGroupName(editingGroup?.name || "")
    }
  }, [open, editingGroup])

  const handleSubmit = async () => {
    const success = await onSubmit(groupName)
    if (success) {
      setGroupName("")
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edytuj Różę" : "Utwórz Nową Różę"}
      description={isEditing ? "Zmień nazwę istniejącej grupy." : "Dodaj nową grupę modlitewną."}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="space-y-2">
        <Label>Nazwa Róży</Label>
        <Input
          placeholder="np. Róża pw. Św. Rity"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          autoFocus
        />
      </div>
    </FormDialog>
  )
}
