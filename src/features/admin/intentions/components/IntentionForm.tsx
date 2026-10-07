import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { intentionSchema, type IntentionFormData } from "@/shared/validation/intention.schema"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Input } from "@/shared/components/ui/input"
import { getCurrentMonthName, getCurrentYear } from "@/shared/lib/formatters"

interface IntentionFormProps {
  loading: boolean
  saved: boolean
  onSave: (title: string, content: string) => Promise<boolean>
}

/**
 * Formularz tworzenia nowej intencji miesięcznej
 */
export function IntentionForm({ loading, saved, onSave }: IntentionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IntentionFormData>({
    resolver: zodResolver(intentionSchema),
  })

  const currentYear = getCurrentYear()
  const monthName = getCurrentMonthName()

  const onSubmit = async (data: IntentionFormData) => {
    const success = await onSave(data.title, data.content)
    if (success) {
      reset()
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold">Nowa intencja na {monthName} {currentYear}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Nagłówek</Label>
          <Input id="title" {...register("title")} className="font-semibold" />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Treść modlitwy</Label>
          <Textarea
            id="content"
            className="min-h-[120px] text-base leading-relaxed"
            {...register("content")}
          />
          {errors.content && (
            <p className="text-sm text-destructive">{errors.content.message}</p>
          )}
        </div>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[150px]">
          {loading ? "Zapisywanie..." : saved ? "Zapisano" : "Zapisz intencję"}
        </Button>
      </form>
    </section>
  )
}
