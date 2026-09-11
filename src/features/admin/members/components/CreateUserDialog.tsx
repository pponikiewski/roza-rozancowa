import { useState, useMemo } from "react"
import { FormDialog } from "@/shared/components/feedback"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { GroupSelect } from "./GroupSelect"
import type { CreateUserFormData } from "@/shared/validation/member.schema"
import { passwordField } from "@/shared/validation/common.schema"
import type { Group } from "@/shared/types/domain.types"

/**
 * Generuje podgląd loginu z imienia i nazwiska
 * Polskie znaki → ASCII, lowercase, spacja → kropka
 */
function generateLoginPreview(fullName: string): string {
  const polishMap: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
    'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  }

  return fullName
    .toLowerCase()
    .trim()
    .replace(/[ąćęłńóśźż]/g, (ch) => polishMap[ch] || ch)
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.-]/g, '')
}

const INITIAL_FORM_DATA: CreateUserFormData = {
  password: "",
  fullName: "",
  groupId: "unassigned",
}

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateUserFormData) => Promise<void>
  groups: Group[]
  groupMemberCounts: Record<number, number>
  loading: boolean
}

/**
 * Dialog do tworzenia nowego użytkownika
 * Zawiera formularz z walidacją hasła, imienia i przypisania do grupy
 */
export function CreateUserDialog({ open, onOpenChange, onSubmit, groups, groupMemberCounts, loading }: CreateUserDialogProps) {
  const [formData, setFormData] = useState<CreateUserFormData>(INITIAL_FORM_DATA)

  const loginPreview = useMemo(
    () => generateLoginPreview(formData.fullName),
    [formData.fullName]
  )

  const passwordValidation = passwordField.safeParse(formData.password)
  const passwordError = formData.password && !passwordValidation.success
    ? passwordValidation.error.issues[0]?.message
    : undefined

  const handleSubmit = async () => {
    await onSubmit(formData)
    setFormData(INITIAL_FORM_DATA)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nowy członek"
      description="Utwórz konto dla nowej osoby."
      onSubmit={handleSubmit}
      loading={loading}
      submitDisabled={!passwordValidation.success}
      submitText="Utwórz"
    >
      <div className="space-y-2">
        <Label>Imię i Nazwisko</Label>
        <Input
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
        {loginPreview && (
          <p className="text-xs text-muted-foreground">
            Login: <span className="font-mono font-medium text-foreground">{loginPreview}</span>
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Hasło</Label>
        <Input
          required
          type="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
      </div>
      <div className="space-y-2">
        <Label>Grupa</Label>
        <GroupSelect
          value={formData.groupId}
          onValueChange={(val) => setFormData({ ...formData, groupId: val })}
          groups={groups}
          groupMemberCounts={groupMemberCounts}
        />
      </div>
    </FormDialog>
  )
}
