import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { intentionSchema, type IntentionFormData } from "@/shared/validation/intention.schema"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Input } from "@/shared/components/ui/input"
import { getMonthName } from "@/shared/lib/formatters"
import type { IntentionHistory } from "@/features/admin/intentions/types/intention.types"

interface IntentionFormProps {
  month: number
  year: number
  /** Intencja zapisana na ten miesiąc (null — jeszcze nie ma) */
  current: IntentionHistory | null
  loading: boolean
  saved: boolean
  onSave: (title: string, content: string) => Promise<boolean>
}

/**
 * Formularz intencji na bieżący miesiąc.
 * Zapisana intencja zostaje w formularzu przez cały miesiąc (zapis ją poprawia);
 * w nowym miesiącu bez intencji formularz jest pusty
 */
export function IntentionForm({ month, year, current, loading, saved, onSave }: IntentionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IntentionFormData>({
    resolver: zodResolver(intentionSchema),
    defaultValues: { title: "", content: "" },
  })

  const currentTitle = current?.title ?? ""
  const currentContent = current?.content ?? ""

  // Po wczytaniu historii, zapisie, usunięciu intencji i na przełomie miesięcy
  useEffect(() => {
    reset({ title: currentTitle, content: currentContent })
  }, [currentTitle, currentContent, month, year, reset])

  const monthName = getMonthName(month)

  const onSubmit = async (data: IntentionFormData) => {
    await onSave(data.title, data.content)
  }

  return (
    <section>
      <h2 className="text-lg font-semibold">
        {current ? "Intencja" : "Nowa intencja"} na {monthName} {year}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {current
          ? "Widoczna dla wszystkich do końca miesiąca. Zapis poprawia tę intencję."
          : `Na ${monthName} nie ma jeszcze intencji.`}
      </p>
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
          {loading ? "Zapisywanie..." : saved ? "Zapisano" : current ? "Zapisz zmiany" : "Zapisz intencję"}
        </Button>
      </form>
    </section>
  )
}
