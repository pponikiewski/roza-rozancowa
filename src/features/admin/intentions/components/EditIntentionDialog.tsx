import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { intentionSchema, type IntentionFormData } from "@/shared/validation/intention.schema"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Input } from "@/shared/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
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

  const onSubmit = async (data: IntentionFormData) => {
    if (intention) {
      const success = await onSave(intention.id, data.title, data.content)
      if (success) {
        onOpenChange(false)
        reset()
      }
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edytuj Intencję</DialogTitle>
          <DialogDescription className="capitalize">
            {intention && `${getMonthName(intention.month)} ${intention.year}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Anuluj
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
