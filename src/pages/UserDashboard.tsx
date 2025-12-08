import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, LogOut, Quote, Sparkles, Timer, HeartHandshake } from "lucide-react"
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
  const [intention, setIntention] = useState<string | null>(null) // NOWE: Stan intencji
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }

      // 1. Profil
      const { data: profileData } = await supabase
        .from('profiles').select('id, full_name, rose_pos, groups(name)').eq('id', user.id).single()
      if (profileData) setProfile(profileData as any)

      // 2. NOWE: Pobieranie Intencji Miesięcznej
      const date = new Date()
      const { data: intentionData } = await supabase
        .from('intentions')
        .select('content')
        .eq('month', date.getMonth() + 1)
        .eq('year', date.getFullYear())
        .single()
      
      if (intentionData) setIntention(intentionData.content)

      // 3. Tajemnica
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
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }
    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
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
    <div className="min-h-[100dvh] w-full bg-background flex flex-col">
      
      {/* HEADER */}
      <header className="px-4 py-3 pr-16 md:pr-24 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-border/50">
            <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">{profile?.full_name.substring(0,1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-xs leading-tight">{profile?.full_name}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{profile?.groups?.name}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="h-9 rounded-full px-3.5 gap-2 border-border/80 bg-background/70 backdrop-blur hover:bg-background/90 hover:text-destructive shadow-sm mt-1"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-xs font-semibold">Wyloguj</span>
        </Button>
      </header>

      {/* CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 py-2 gap-6">
        
        {/* NOWOŚĆ: SEKCJA INTENCJI (Pojawia się tylko jeśli admin ustawił) */}
        {intention && (
          <div className="w-full max-w-sm text-center animate-in fade-in slide-in-from-top-4 duration-700">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 text-[10px] font-bold uppercase tracking-widest mb-2">
                <HeartHandshake className="h-3 w-3" /> Intencja miesięczna
             </div>
             <p className="text-sm font-medium text-foreground/90 leading-relaxed px-2 italic">
                "{intention}"
             </p>
          </div>
        )}

        {/* KARTA TAJEMNICY */}
        <Card className="w-full max-w-sm overflow-hidden border-none shadow-xl bg-card/80 backdrop-blur-md ring-1 ring-border/50 rounded-xl">
          
          {/* OBRAZEK */}
          {mystery.image_url ? (
            <div className="w-full bg-black/5 dark:bg-black/40 p-2 flex items-center justify-center">
               <img 
                 src={mystery.image_url} 
                 alt={mystery.name} 
                 className="w-auto h-auto max-h-[45vh] object-contain shadow-md rounded-md" 
               />
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-muted-foreground bg-muted/20">Brak obrazka</div>
          )}

          <div className="relative">
             <div className="absolute -top-3 left-0 right-0 flex justify-center gap-2 px-4 pointer-events-none">
                <Badge variant="secondary" className="shadow-sm border bg-background/95 backdrop-blur text-[10px] px-2 h-5">{mystery.part}</Badge>
                {profile?.rose_pos && <Badge variant="outline" className="bg-background/95 shadow-sm text-[10px] backdrop-blur px-2 h-5">Miejsce #{profile.rose_pos}</Badge>}
             </div>

             <CardHeader className="text-center pt-4 pb-1 px-4">
               <h2 className="text-lg md:text-xl font-bold text-primary tracking-tight leading-tight">
                  {mystery.name}
                </h2>
             </CardHeader>

             <CardContent className="text-center px-4 pb-4">
                <div className="relative">
                  <Quote className="h-3 w-3 text-primary/10 absolute -top-1 -left-1" />
                  <p className="text-muted-foreground italic leading-relaxed text-sm line-clamp-4 px-2">
                    {mystery.meditation}
                  </p>
                </div>
             </CardContent>

             <CardFooter className="px-6 pb-4 pt-0 justify-center">
                {isAcknowledged ? (
                  // PRZYCISK: Mały, zaokrąglony (rounded-xl)
                  <Button size="sm" className="h-9 w-full max-w-[200px] text-xs font-medium bg-green-600/90 hover:bg-green-600 text-white shadow-sm cursor-default rounded-xl">
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Potwierdzone
                  </Button>
                ) : (
                  // PRZYCISK: Mały, zaokrąglony (rounded-xl)
                  <Button 
                    size="sm"
                    className="h-9 w-full max-w-[200px] text-xs font-semibold shadow-md hover:scale-[1.02] transition-transform rounded-xl" 
                    onClick={handleAcknowledge}
                  >
                    Potwierdzam
                  </Button>
                )}
             </CardFooter>
          </div>
        </Card>

        {/* LICZNIK (RÓŻOWY, POGRUBIONY) */}
        <div className="flex flex-col items-center gap-2 text-muted-foreground animate-in fade-in slide-in-from-bottom-2 shrink-0 pb-4">
           <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-semibold opacity-50">
              <Timer className="h-3 w-3" /> Zmiana tajemnic
           </div>
           
           <div className="flex gap-4 text-xs font-mono bg-muted/30 px-6 py-2 rounded-2xl border border-border/30 shadow-sm backdrop-blur-sm">
              <span className="flex items-baseline gap-0.5 text-rose-500">
                <span className="font-bold text-lg">{timeLeft.days}</span>
                <span className="text-[12px] opacity-80">d</span>
              </span>
              <span className="text-muted-foreground/30 text-lg font-light self-center">:</span>
              <span className="flex items-baseline gap-0.5 text-rose-500">
                <span className="font-bold text-lg">{timeLeft.hours}</span>
                <span className="text-[12px] opacity-80">h</span>
              </span>
              <span className="text-muted-foreground/30 text-lg font-light self-center">:</span>
              <span className="flex items-baseline gap-0.5 text-rose-500">
                <span className="font-bold text-lg">{timeLeft.minutes}</span>
                <span className="text-[12px] opacity-80">m</span>
              </span>
              <span className="text-muted-foreground/30 text-lg font-light self-center">:</span>
              <span className="flex items-baseline gap-0.5 text-rose-500">
                <span className="font-bold text-lg min-w-[1.2em] text-center">{timeLeft.seconds}</span>
                <span className="text-[12px] opacity-80">s</span>
              </span>
           </div>
        </div>

      </main>
    </div>
  )
}