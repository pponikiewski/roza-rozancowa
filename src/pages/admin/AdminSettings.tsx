import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Save, CalendarHeart, Check, History } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminSettings() {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  const date = new Date()
  const currentMonth = date.getMonth() + 1
  const currentYear = date.getFullYear()
  const monthName = date.toLocaleString('pl-PL', { month: 'long' })

  useEffect(() => {
    fetchIntention()
    fetchHistory()
  }, [])

  const fetchIntention = async () => {
    const { data } = await supabase
      .from('intentions')
      .select('title, content')
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single()
    
    if (data) {
      setTitle(data.title || "")
      setContent(data.content || "")
    }
  }

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('intentions')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
    
    if (data) {
      setHistory(data)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)

    const { error } = await supabase
      .from('intentions')
      .upsert({ 
        month: currentMonth, 
        year: currentYear, 
        title: title,
        content: content 
      }, { onConflict: 'month, year' })

    setLoading(false)

    if (error) {
      alert("Błąd: " + error.message)
    } else {
      setSaved(true)
      setTitle("")
      setContent("")
      fetchHistory()
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('pl-PL', { month: 'long' });
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Intencja</h1>
        <p className="text-muted-foreground">Zmiana intencji modlitwy na dany miesiąc.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
             <div className="p-2 bg-rose-100 dark:bg-rose-900/20 rounded-full text-rose-600">
               <CalendarHeart className="h-6 w-6" />
             </div>
             <div>
                <CardTitle>Intencja Miesięczna</CardTitle>
                <CardDescription className="capitalize">
                  Na {monthName} {currentYear}
                </CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="title">Nagłówek</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Treść modlitwy</Label>
            <Textarea 
              id="content" 
              className="min-h-[120px] text-base leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto min-w-[150px]">
            {loading ? "Zapisywanie..." : saved ? <><Check className="mr-2 h-4 w-4" /> Zapisano</> : <><Save className="mr-2 h-4 w-4" /> Zapisz Intencję</>}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
             <div className="p-2 bg-muted rounded-full">
               <History className="h-5 w-5" />
             </div>
             <CardTitle>Historia Intencji</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Miesiąc</TableHead>
                <TableHead>Intencja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={`${item.year}-${item.month}`}>
                  <TableCell className="font-medium capitalize">
                    {getMonthName(item.month)} {item.year}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs mb-1">{item.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{item.content}</div>
                  </TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                    Brak historii intencji
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}