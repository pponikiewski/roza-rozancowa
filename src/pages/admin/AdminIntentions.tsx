import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Save, CalendarHeart, Check, History, HandHeart, Pencil, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdminIntentions } from "@/hooks/useAdminIntentions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { IntentionHistory } from "@/types"

export default function AdminIntentions() {
  const {
    loading,
    history,
    saved,
    saveIntention,
    updateIntention,
    deleteIntention
  } = useAdminIntentions()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingIntention, setEditingIntention] = useState<IntentionHistory | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  const date = new Date()
  const currentYear = date.getFullYear()
  const monthName = date.toLocaleString('pl-PL', { month: 'long' })

  const handleSaveWrapper = async () => {
    const success = await saveIntention(title, content)
    if (success) {
      setTitle("")
      setContent("")
    }
  }

  const handleEdit = (intention: IntentionHistory) => {
    setEditingIntention(intention)
    setEditTitle(intention.title)
    setEditContent(intention.content)
    setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (editingIntention) {
      const success = await updateIntention(editingIntention.id, editTitle, editContent)
      if (success) {
        setEditDialogOpen(false)
        setEditingIntention(null)
        setEditTitle("")
        setEditContent("")
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
          <div className="space-y-2">
            <Label htmlFor="title">Nagłówek</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="font-semibold" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Treść modlitwy</Label>
            <Textarea id="content" className="min-h-[120px] text-base leading-relaxed" value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <Button onClick={handleSaveWrapper} disabled={loading} className="w-full sm:w-auto min-w-[150px]">
            {loading ? "Zapisywanie..." : saved ? <><Check className="mr-2 h-4 w-4" /> Zapisano</> : <><Save className="mr-2 h-4 w-4" /> Zapisz Intencję</>}
          </Button>
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
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Nagłówek</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Treść modlitwy</Label>
              <Textarea
                id="edit-content"
                className="min-h-[120px] text-base leading-relaxed"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
