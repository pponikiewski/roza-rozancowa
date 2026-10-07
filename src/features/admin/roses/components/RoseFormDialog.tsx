import { useState, useEffect } from "react"
import { FormDialog } from "@/shared/components/feedback"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { getMonthName } from "@/shared/lib/formatters"
import type { Group } from "@/shared/types/domain.types"
import type { RoseAdmission } from "@/features/admin/roses/types/rose.types"

interface RoseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingGroup: Group | null
  onSubmit: (name: string, admission: RoseAdmission) => Promise<boolean>
  loading: boolean
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

/**
 * Walidacja dnia przyjęcia: oba pola puste (brak) albo poprawna data dzień + miesiąc
 * (29 lutego dozwolony)
 */
function parseAdmission(day: string, month: string): { admission: RoseAdmission; error: string | null } {
  if (!day && !month) return { admission: null, error: null }
  const d = Number(day)
  const m = Number(month)
  if (!d || !m) return { admission: null, error: "Podaj dzień i miesiąc albo zostaw oba pola puste" }
  const date = new Date(2000, m - 1, d)
  if (date.getMonth() !== m - 1 || date.getDate() !== d) {
    return { admission: null, error: "Nieprawidłowa data" }
  }
  return { admission: { month: m, day: d }, error: null }
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
  const [admissionDay, setAdmissionDay] = useState("")
  const [admissionMonth, setAdmissionMonth] = useState("")
  const [admissionError, setAdmissionError] = useState<string | null>(null)
  const isEditing = !!editingGroup

  // Wypełnij pola danymi Róży gdy otwieramy dialog
  useEffect(() => {
    if (open) {
      setGroupName(editingGroup?.name || "")
      setAdmissionDay(editingGroup?.admission_day ? String(editingGroup.admission_day) : "")
      setAdmissionMonth(editingGroup?.admission_month ? String(editingGroup.admission_month) : "")
      setAdmissionError(null)
    }
  }, [open, editingGroup])

  const handleSubmit = async () => {
    const { admission, error } = parseAdmission(admissionDay, admissionMonth)
    setAdmissionError(error)
    if (error) return

    const success = await onSubmit(groupName, admission)
    if (success) {
      setGroupName("")
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edytuj Różę" : "Utwórz Nową Różę"}
      description={isEditing ? "Zmień dane istniejącej grupy." : "Dodaj nową grupę modlitewną."}
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

      <div className="space-y-2">
        <Label htmlFor="admission-day">Dzień przyjęcia do Stowarzyszenia (opcjonalnie)</Label>
        <div className="flex gap-2">
          <Input
            id="admission-day"
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            placeholder="Dzień"
            value={admissionDay}
            onChange={(e) => setAdmissionDay(e.target.value)}
            className="w-24"
          />
          <select
            aria-label="Miesiąc przyjęcia"
            value={admissionMonth}
            onChange={(e) => setAdmissionMonth(e.target.value)}
            className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Miesiąc</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>
        </div>
        {admissionError && <p className="text-sm text-destructive">{admissionError}</p>}
        <p className="text-xs text-muted-foreground">
          Co roku w tym dniu członkowie Róży dostaną powiadomienie o odpuście.
        </p>
      </div>
    </FormDialog>
  )
}
