import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Save, CalendarHeart, Check, History, HandHeart } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdminIntentions } from "@/hooks/useAdminIntentions"

export default function AdminIntentions() {
  const {
    loading,
    history,
    saved,
    saveIntention
  } = useAdminIntentions()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

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
            <TableHeader><TableRow><TableHead className="w-[150px]">Miesiąc</TableHead><TableHead>Intencja</TableHead></TableRow></TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={`${item.year}-${item.month}`}>
                  <TableCell className="font-medium capitalize">{getMonthName(item.month)} {item.year}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs mb-1">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.content}</div>
                  </TableCell>
                </TableRow>
              ))}
              {history.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-6">Brak historii intencji</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
