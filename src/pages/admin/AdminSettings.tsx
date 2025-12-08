import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, CalendarHeart, Check } from "lucide-react"

export default function AdminSettings() {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")
  const [saved, setSaved] = useState(false)

  // Pobieramy obecną datę
  const date = new Date()
  const currentMonth = date.getMonth() + 1
  const currentYear = date.getFullYear()

  // Nazwa miesiąca po polsku
  const monthName = date.toLocaleString('pl-PL', { month: 'long' })

  useEffect(() => {
    fetchIntention()
  }, [])

  const fetchIntention = async () => {
    const { data } = await supabase
      .from('intentions')
      .select('content')
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single()
    
    if (data) setContent(data.content)
  }

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)

    // Upsert (Wstaw lub Aktualizuj jeśli istnieje)
    const { error } = await supabase
      .from('intentions')
      .upsert({ 
        month: currentMonth, 
        year: currentYear, 
        content: content 
      }, { onConflict: 'month, year' })

    setLoading(false)

    if (error) {
      alert("Błąd: " + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000) // Ukryj "Zapisano" po 3s
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ustawienia</h1>
        <p className="text-muted-foreground">Konfiguracja aplikacji.</p>
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intention">Treść intencji</Label>
            <Textarea 
              id="intention" 
              placeholder="Wpisz intencję, w której będziemy się modlić w tym miesiącu..." 
              className="min-h-[120px] text-base leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Ta treść będzie widoczna dla wszystkich użytkowników na ich stronie głównej.
            </p>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto min-w-[150px]">
            {loading ? (
              "Zapisywanie..."
            ) : saved ? (
              <><Check className="mr-2 h-4 w-4" /> Zapisano</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Zapisz Intencję</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}