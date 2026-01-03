import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { intentionSchema, type IntentionFormData } from "@/shared/validation/intention.schema"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Input } from "@/shared/components/ui/input"
import { Save, CalendarHeart, Check, History, HandHeart, Pencil, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { useAdminIntentions } from "@/features/admin/intentions/hooks/useAdminIntentions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import type { IntentionHistory } from "@/features/admin/intentions/types/intention.types"

export default function AdminIntentionsPage() {
  const {
    loading,
    history,
    saved,
    saveIntention,
    updateIntention,
    deleteIntention
  } = useAdminIntentions()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingIntention, setEditingIntention] = useState<IntentionHistory | null>(null)

  // Formularz główny (nowa intencja)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IntentionFormData>({
    resolver: zodResolver(intentionSchema),
  })

  // Formularz edycji
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    setValue: setValueEdit,
    reset: resetEdit,
  } = useForm<IntentionFormData>({
    resolver: zodResolver(intentionSchema),
  })

  const date = new Date()
  const currentYear = date.getFullYear()
  const monthName = date.toLocaleString('pl-PL', { month: 'long' })

  const onSubmit = async (data: IntentionFormData) => {
    const success = await saveIntention(data.title, data.content)
    if (success) {
      reset()
    }
  }

  const handleEdit = (intention: IntentionHistory) => {
    setEditingIntention(intention)
    setValueEdit("title", intention.title)
    setValueEdit("content", intention.content)
    setEditDialogOpen(true)
  }

  const onSubmitEdit = async (data: IntentionFormData) => {
    if (editingIntention) {
      const success = await updateIntention(editingIntention.id, data.title, data.content)
      if (success) {
        setEditDialogOpen(false)
        setEditingIntention(null)
        resetEdit()
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Czy na pewno chcesz usunąć tę intencję?")) {
      await deleteIntention(id)
    }
  }

  const getMonthName = (m: number) => new Date(0, m - 1).toLocaleString('pl-PL', { month: 'long' })

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6 pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><HandHeart className="h-6 w-6 text-primary" /> Intencja</h1>
        <p className="text-muted-foreground">Zmiana intencji modlitwy na dany miesiąc.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/20 rounded-full text-rose-600"><CalendarHeart className="h-6 w-6" /></div>
            <div><CardTitle>Intencja Miesięczna</CardTitle><CardDescription className="capitalize">Na {monthName} {currentYear}</CardDescription></div>
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
              <Textarea id="content" className="min-h-[120px] text-base leading-relaxed" {...register("content")} />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[150px]">
              {loading ? "Zapisywanie..." : saved ? <><Check className="mr-2 h-4 w-4" /> Zapisano</> : <><Save className="mr-2 h-4 w-4" /> Zapisz Intencję</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><div className="p-2 bg-muted rounded-full"><History className="h-5 w-5" /></div><CardTitle>Historia Intencji</CardTitle></div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead className="w-[150px]">Miesiąc</TableHead><TableHead>Intencja</TableHead><TableHead className="w-[120px]">Akcje</TableHead></TableRow></TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={`${item.year}-${item.month}`}>
                  <TableCell className="font-medium capitalize">{getMonthName(item.month)} {item.year}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs mb-1">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.content}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {history.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">Brak historii intencji</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edytuj Intencję</DialogTitle>
            <DialogDescription className="capitalize">
              {editingIntention && `${getMonthName(editingIntention.month)} ${editingIntention.year}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Nagłówek</Label>
                <Input
                  id="edit-title"
                  {...registerEdit("title")}
                  className="font-semibold"
                />
                {errorsEdit.title && (
                  <p className="text-sm text-destructive">{errorsEdit.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Treść modlitwy</Label>
                <Textarea
                  id="edit-content"
                  className="min-h-[120px] text-base leading-relaxed"
                  {...registerEdit("content")}
                />
                {errorsEdit.content && (
                  <p className="text-sm text-destructive">{errorsEdit.content.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
