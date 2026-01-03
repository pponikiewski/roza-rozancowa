import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { intentionSchema, type IntentionFormData } from "@/shared/validation/intention.schema"
import { FormDialog } from "@/shared/components/feedback"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Input } from "@/shared/components/ui/input"
import type { IntentionHistory } from "@/features/admin/intentions/types/intention.types"

interface EditIntentionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  intention: IntentionHistory | null
  loading: boolean
  onSave: (id: number, title: string, content: string) => Promise<boolean>
}

/**
 * Dialog do edycji istniejącej intencji
 */
export function EditIntentionDialog({
  open,
  onOpenChange,
  intention,
  loading,
  onSave,
}: EditIntentionDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<IntentionFormData>({
    resolver: zodResolver(intentionSchema),
  })

  // Wypełnij formularz danymi intencji gdy dialog się otwiera
  useEffect(() => {
    if (intention && open) {
      setValue("title", intention.title)
      setValue("content", intention.content)
    }
  }, [intention, open, setValue])

  const getMonthName = (m: number) =>
    new Date(0, m - 1).toLocaleString('pl-PL', { month: 'long' })

  const onSubmit = async () => {
    await handleSubmit(async (data: IntentionFormData) => {
      if (intention) {
        const success = await onSave(intention.id, data.title, data.content)
        if (success) {
          onOpenChange(false)
          reset()
        }
      }
    })()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) reset()
        onOpenChange(isOpen)
      }}
      title="Edytuj Intencję"
      description={intention ? `${getMonthName(intention.month)} ${intention.year}` : ""}
      onSubmit={onSubmit}
      loading={loading}
      submitText="Zapisz zmiany"
      className="sm:max-w-[500px]"
    >
      <div className="space-y-2">
        <Label htmlFor="edit-title">Nagłówek</Label>
        <Input
          id="edit-title"
          {...register("title")}
          className="font-semibold"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-content">Treść modlitwy</Label>
        <Textarea
          id="edit-content"
          className="min-h-[120px] text-base leading-relaxed"
          {...register("content")}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>
    </FormDialog>
  )
}
