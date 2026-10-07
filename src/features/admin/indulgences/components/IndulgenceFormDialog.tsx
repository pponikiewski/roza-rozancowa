import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { indulgenceSchema, type IndulgenceFormData } from "@/shared/validation/indulgence.schema"
import { FormDialog } from "@/shared/components/feedback"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Input } from "@/shared/components/ui/input"
import type { IndulgenceDay, IndulgenceInput } from "@/features/admin/indulgences/types/indulgence.types"

interface IndulgenceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = nowy dzień odpustu */
  indulgence: IndulgenceDay | null
  loading: boolean
  onSave: (input: IndulgenceInput) => Promise<boolean>
}

const pad = (n: number) => String(n).padStart(2, "0")

function toFormValues(indulgence: IndulgenceDay | null): IndulgenceFormData {
  const today = new Date()
  const todayValue = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  if (!indulgence) {
    return { name: "", description: "", dateKind: "fixed", date: todayValue, repeatYearly: true }
  }
  return {
    name: indulgence.name,
    description: indulgence.description ?? "",
    dateKind: indulgence.is_easter ? "easter" : "fixed",
    date: indulgence.month && indulgence.day
      ? `${indulgence.year ?? today.getFullYear()}-${pad(indulgence.month)}-${pad(indulgence.day)}`
      : todayValue,
    repeatYearly: indulgence.year === null,
  }
}

/**
 * Dialog dodawania i edycji dnia odpustu
 */
export function IndulgenceFormDialog({
  open,
  onOpenChange,
  indulgence,
  loading,
  onSave,
}: IndulgenceFormDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<IndulgenceFormData>({
    resolver: zodResolver(indulgenceSchema),
    defaultValues: toFormValues(null),
  })

  // Wypełnij formularz przy każdym otwarciu
  useEffect(() => {
    if (open) reset(toFormValues(indulgence))
  }, [open, indulgence, reset])

  const isEasterKind = useWatch({ control, name: "dateKind" }) === "easter"

  const onSubmit = async () => {
    await handleSubmit(async (data: IndulgenceFormData) => {
      const [year, month, day] = data.date.split("-").map(Number)
      const isEaster = data.dateKind === "easter"
      const success = await onSave({
        name: data.name,
        description: data.description || null,
        month: isEaster ? null : month,
        day: isEaster ? null : day,
        year: isEaster || data.repeatYearly ? null : year,
        is_easter: isEaster,
      })
      if (success) onOpenChange(false)
    })()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={indulgence ? "Edytuj dzień odpustu" : "Nowy dzień odpustu"}
      description="W tym dniu członkowie Róż dostaną powiadomienie o odpuście."
      onSubmit={onSubmit}
      loading={loading}
      submitText={indulgence ? "Zapisz zmiany" : "Dodaj"}
      className="sm:max-w-[500px]"
    >
      <div className="space-y-2">
        <Label htmlFor="indulgence-name">Nazwa</Label>
        <Input
          id="indulgence-name"
          placeholder="np. Święto Matki Bożej Różańcowej"
          {...register("name")}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="indulgence-date">Data</Label>
        {isEasterKind ? (
          // Wielkanoc (z listy startowej): data liczona automatycznie, bez edycji
          <p className="text-sm text-muted-foreground rounded-md border bg-muted/30 px-3 py-2">
            Wielkanoc. Data jest liczona automatycznie co roku.
          </p>
        ) : (
          <>
            <Input id="indulgence-date" type="date" {...register("date")} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" className="h-4 w-4 accent-primary" {...register("repeatYearly")} />
              Powtarzaj co roku
            </label>
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="indulgence-description">Warunki uzyskania odpustu (opcjonalnie)</Label>
        <Textarea
          id="indulgence-description"
          className="min-h-[100px] text-base leading-relaxed"
          {...register("description")}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>
    </FormDialog>
  )
}
