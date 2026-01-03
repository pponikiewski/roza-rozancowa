import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { intentionSchema, type IntentionFormData } from "@/shared/validation/intention.schema"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Input } from "@/shared/components/ui/input"
import { Save, CalendarHeart, Check } from "lucide-react"

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

  const date = new Date()
  const currentYear = date.getFullYear()
  const monthName = date.toLocaleString('pl-PL', { month: 'long' })

  const onSubmit = async (data: IntentionFormData) => {
    const success = await onSave(data.title, data.content)
    if (success) {
      reset()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/20 rounded-full text-rose-600">
            <CalendarHeart className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Intencja Miesięczna</CardTitle>
            <CardDescription className="capitalize">Na {monthName} {currentYear}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            {loading ? (
              "Zapisywanie..."
            ) : saved ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Zapisano
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Zapisz Intencję
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
