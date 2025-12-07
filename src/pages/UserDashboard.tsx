import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, LogOut, Quote, Sparkles, Timer } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// --- TYPY ---
interface Mystery {
  id: number; part: string; name: string; meditation: string; image_url: string;
}
interface Profile {
  id: string; full_name: string; rose_pos: number | null; groups: { name: string } | null;
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mystery, setMystery] = useState<Mystery | null>(null)
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }

      const { data: profileData } = await supabase
        .from('profiles').select('id, full_name, rose_pos, groups(name)').eq('id', user.id).single()
      if (profileData) setProfile(profileData as any)

      let currentMysteryId: number | null = null
      const { data: calculatedId } = await supabase.rpc('get_mystery_id_for_user', { p_user_id: user.id })
      if (calculatedId) currentMysteryId = calculatedId

      if (!currentMysteryId) {
        setMystery(null); setLoading(false); return
      }

      const { data: mysteryData } = await supabase.from('mysteries').select('*').eq('id', currentMysteryId).single()
      setMystery(mysteryData)

      const { data: ackData } = await supabase.from('acknowledgments').select('*').eq('user_id', user.id).eq('mystery_id', currentMysteryId).single()
      setIsAcknowledged(!!ackData)
      setLoading(false)
    }
    fetchData()
  }, [navigate])

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      let nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      let dayOfWeek = nextMonth.getDay()
      let daysUntilSunday = (7 - dayOfWeek) % 7 
      nextMonth.setDate(nextMonth.getDate() + daysUntilSunday)
      nextMonth.setHours(0, 0, 0, 0) 
      const difference = nextMonth.getTime() - now.getTime()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        })
      }
    }
    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000)
    return () => clearInterval(timer)
  }, [])

  const handleAcknowledge = async () => {
    if (!profile || !mystery) return
    const { error } = await supabase.from('acknowledgments').insert({ user_id: profile.id, mystery_id: mystery.id })
    if (error) alert("Błąd: " + error.message)
    else setIsAcknowledged(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background text-muted-foreground flex-col gap-2">
      <Sparkles className="h-8 w-8 animate-pulse text-primary" />
      <p>Ładowanie...</p>
    </div>
  )

  if (!mystery) return (
    <div className="flex flex-col min-h-screen bg-background p-6 items-center justify-center text-center gap-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-full">
        <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Brak przydziału</h2>
        <p className="text-muted-foreground max-w-xs mx-auto">Witaj, <b>{profile?.full_name}</b>. Nie należysz jeszcze do żadnej Róży.</p>
      </div>
      <Button variant="outline" onClick={handleLogout}>Wyloguj się</Button>
    </div>
  )

  return (
    // ZMIANA: min-h-screen pozwala stronie rosnąć. Flexbox centruje, ale py-8 daje marginesy, żeby nie dotykać krawędzi.
    <div className="min-h-screen w-full bg-background flex flex-col">
      
      {/* HEADER */}
      <header className="px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border/50">
            <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">{profile?.full_name.substring(0,1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">{profile?.full_name}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{profile?.groups?.name}</span>
          </div>
        </div>
        <div className="pr-12">
           <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive h-9 w-9">
             <LogOut className="h-5 w-5" />
           </Button>
        </div>
      </header>

      {/* CONTENT: justify-center wyśrodkuje na dużych ekranach. Na małych paddingi (py-8) zapewnią odstęp. */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 py-8">
        
        <Card className="w-full max-w-md overflow-hidden border-none shadow-xl bg-card/80 backdrop-blur-md ring-1 ring-border/50">
          
          {/* OBRAZEK: 
              max-h-[40vh] - na wysokich ekranach zajmie max 40%.
              h-auto - na małych dostosuje się proporcjonalnie.
          */}
          {mystery.image_url ? (
            <div className="w-full bg-black/5 dark:bg-black/40 p-4 flex items-center justify-center">
               <img 
                 src={mystery.image_url} 
                 alt={mystery.name} 
                 className="w-auto h-auto max-h-[40vh] object-contain shadow-md rounded-sm" 
               />
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground bg-muted/20">Brak obrazka</div>
          )}

          <div className="relative">
             {/* Badge przeniesione nieco wyżej dla estetyki */}
             <div className="absolute -top-3 left-0 right-0 flex justify-center gap-2 px-4 pointer-events-none">
                <Badge variant="secondary" className="shadow-sm border bg-background/95 backdrop-blur text-xs">{mystery.part}</Badge>
                {profile?.rose_pos && <Badge variant="outline" className="bg-background/95 shadow-sm text-xs backdrop-blur">Miejsce #{profile.rose_pos}</Badge>}
             </div>

             <CardHeader className="text-center pt-6 pb-2 px-4">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-primary tracking-tight leading-tight mt-1">
                  {mystery.name}
                </h2>
             </CardHeader>

             <CardContent className="text-center px-6 pb-6">
                <div className="relative">
                  <Quote className="h-4 w-4 text-primary/10 absolute -top-1 -left-2" />
                  <p className="text-muted-foreground italic leading-relaxed font-serif text-sm md:text-base line-clamp-6 px-2">
                    {mystery.meditation}
                  </p>
                </div>
             </CardContent>

             <CardFooter className="px-6 pb-6 pt-0">
                {isAcknowledged ? (
                  <Button className="w-full h-12 text-base bg-green-600 hover:bg-green-700 text-white shadow-sm cursor-default">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Potwierdzone
                  </Button>
                ) : (
                  <Button 
                    className="w-full h-12 text-base font-semibold shadow-md hover:scale-[1.02] transition-transform" 
                    onClick={handleAcknowledge}
                  >
                    Potwierdzam
                  </Button>
                )}
             </CardFooter>
          </div>
        </Card>

        {/* LICZNIK: Marginesy (my-8) oddzielają go od karty i stopki strony */}
        <div className="my-8 flex flex-col items-center gap-2 text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
           <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold opacity-60">
              <Timer className="h-3 w-3" /> Zmiana tajemnic
           </div>
           
           <div className="flex gap-3 text-sm font-mono bg-muted/40 px-6 py-2 rounded-full border border-border/40 shadow-sm backdrop-blur-sm">
              <span className="flex items-baseline gap-0.5"><span className="font-bold text-foreground text-lg">{timeLeft.days}</span>d</span>
              <span className="text-muted-foreground/30 text-lg">:</span>
              <span className="flex items-baseline gap-0.5"><span className="font-bold text-foreground text-lg">{timeLeft.hours}</span>h</span>
              <span className="text-muted-foreground/30 text-lg">:</span>
              <span className="flex items-baseline gap-0.5"><span className="font-bold text-foreground text-lg">{timeLeft.minutes}</span>m</span>
           </div>
        </div>

      </main>
    </div>
  )
}