import { useState } from "react"
import { FormDialog } from "@/shared/components/feedback"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { GroupSelect } from "./GroupSelect"
import type { CreateUserFormData } from "@/shared/validation/member.schema"
import type { Group } from "@/shared/types/domain.types"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateUserFormData) => Promise<void>
  groups: Group[]
  loading: boolean
}

/**
 * Dialog do tworzenia nowego użytkownika
 * Zawiera formularz z walidacją email, hasła, imienia i przypisania do grupy
 */
export function CreateUserDialog({ open, onOpenChange, onSubmit, groups, loading }: CreateUserDialogProps) {
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: "",
    password: "",
    fullName: "",
    groupId: "unassigned",
  })

  const handleSubmit = async () => {
    await onSubmit(formData)
    // Reset form
    setFormData({
      email: "",
      password: "",
      fullName: "",
      groupId: "unassigned",
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nowy członek"
      description="Utwórz konto dla nowej osoby."
      onSubmit={handleSubmit}
      loading={loading}
      submitText="Utwórz"
    >
      <div className="space-y-2">
        <Label>Imię i Nazwisko</Label>
        <Input
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Hasło</Label>
          <Input
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Grupa</Label>
        <GroupSelect
          value={formData.groupId}
          onValueChange={(val) => setFormData({ ...formData, groupId: val })}
          groups={groups}
        />
      </div>
    </FormDialog>
  )
}
