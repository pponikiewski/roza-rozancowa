import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CheckCircle2, AlertCircle, LogOut, Timer, ChevronRight, Loader2, Users, Flower2, ScrollText } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// --- TYPY ---
interface Mystery {
  id: number; part: string; name: string; meditation: string; image_url: string;
}
interface Profile {
  id: string; full_name: string; rose_pos: number | null; groups: { id: number, name: string } | null;
}
interface Intention {
  title: string;
  content: string;
}
interface RoseMember {
  id: string
  full_name: string
  rose_pos: number | null
  current_mystery_name: string
}

export default function UserDashboard() {
  const navigate = useNavigate()
  
  // Stany główne
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mystery, setMystery] = useState<Mystery | null>(null)
  const [intention, setIntention] = useState<Intention | null>(null) 
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Stany dla Modala "Moja Róża"
  const [isRoseOpen, setIsRoseOpen] = useState(false)
  const [roseMembers, setRoseMembers] = useState<RoseMember[]>([])
  const [roseLoading, setRoseLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }

      // 1. Profil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, rose_pos, groups(id, name)')
        .eq('id', user.id)
        .single()
      
      if (profileData) setProfile(profileData as any)

      // 2. Intencja
      const date = new Date()
      const { data: intentionData } = await supabase
        .from('intentions')
        .select('title, content')
        .eq('month', date.getMonth() + 1)
        .eq('year', date.getFullYear())
        .single()
      
      if (intentionData) {
        setIntention({
          title: intentionData.title || "",
          content: intentionData.content
        })
      }

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

  const handleOpenRose = async () => {
    setIsRoseOpen(true)
    if (!profile?.groups?.id || roseMembers.length > 0) return

    setRoseLoading(true)
    try {
        const { data: members, error } = await supabase
            .from('profiles')
            .select('id, full_name, rose_pos')
            .eq('group_id', profile.groups.id)
            .order('rose_pos', { ascending: true })

        if (error) throw error

        const { data: allMysteries } = await supabase.from('mysteries').select('id, name')

        if (members && allMysteries) {
            const processed = await Promise.all(members.map(async (m) => {
                const { data: mysteryId } = await supabase.rpc('get_mystery_id_for_user', { p_user_id: m.id })
                const mysteryName = allMysteries.find(mys => mys.id === mysteryId)?.name || "Brak przydziału"
                
                return {
                    id: m.id,
                    full_name: m.full_name,
                    rose_pos: m.rose_pos,
                    current_mystery_name: mysteryName
                }
            }))
            setRoseMembers(processed)
        }
    } catch (err) {
        console.error("Błąd pobierania róży:", err)
    } finally {
        setRoseLoading(false)
    }
  }

  const handleAcknowledge = async () => {
    if (!profile || !mystery) return
    setActionLoading(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    const { error } = await supabase.from('acknowledgments').insert({ user_id: profile.id, mystery_id: mystery.id })
    if (error) {
        alert("Błąd: " + error.message)
    } else {
        setIsAcknowledged(true)
    }
    setActionLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/30">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Ładowanie...</p>
      </div>
    </div>
  )

  if (!mystery) return (
    <div className="flex flex-col min-h-screen bg-muted/30 p-6 items-center justify-center text-center">
      <Card className="w-full max-w-sm border-dashed border-2 shadow-none bg-transparent">
        <CardHeader className="items-center pb-2">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full mb-2">
                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Brak przydziału</h2>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
                Witaj, <span className="font-medium text-foreground">{profile?.full_name}</span>.<br/>
                Wygląda na to, że nie należysz jeszcze do żadnej Róży lub administrator nie aktywował Twojego konta.
            </p>
        </CardContent>
        <CardFooter className="justify-center pt-2">
             <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" /> Wyloguj się
             </Button>
        </CardFooter>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen w-full bg-muted/20 flex flex-col pb-safe">
      
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-6 py-3 flex justify-between items-center shadow-sm">
        
        <div 
            className="flex items-center gap-3 cursor-pointer p-1.5 -ml-1.5 rounded-lg hover:bg-muted/60 transition-colors group select-none"
            onClick={handleOpenRose}
            title="Kliknij, aby zobaczyć swoją Różę"
        >
          <Avatar className="h-9 w-9 border-2 border-primary/10 group-hover:border-primary/40 transition-colors">
            <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold">
                {profile?.full_name.substring(0,1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none flex items-center gap-1.5">
                {profile?.full_name}
                <Users className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 font-medium group-hover:text-foreground transition-colors">
                {profile?.groups?.name || "Brak grupy"}
            </span>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
             <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* CONTENT */}
      <main className="flex-1 w-full max-w-lg mx-auto p-4 flex flex-col gap-5">
        
        {intention && (
          <div className="bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-background border border-rose-100 dark:border-rose-900/50 rounded-xl p-5 shadow-sm">
             <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Intencja na {new Date().toLocaleString('pl-PL', { month: 'long' })}
                    </span>
                </div>
                {intention.title && (
                    <h3 className="text-sm font-semibold mb-1 text-foreground/90">{intention.title}</h3>
                )}
                <p className="text-sm text-muted-foreground/90 italic leading-relaxed">
                    "{intention.content}"
                </p>
             </div>
          </div>
        )}

        <Card className="overflow-hidden shadow-lg border-border/60">
          <div className="w-full bg-black/5 dark:bg-black/20 flex items-center justify-center p-4">
             {mystery.image_url ? (
                <img 
                 src={mystery.image_url} 
                 alt={mystery.name} 
                 className="w-auto h-auto max-h-[50vh] object-contain shadow-sm rounded-md" 
               />
             ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Brak wizualizacji</div>
             )}
          </div>

          <CardHeader className="pb-2 pt-5">
            <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase text-[10px] tracking-wider">
                    {mystery.part}
                </Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {mystery.name}
            </h2>
          </CardHeader>
            
          <CardContent className="pb-2">
            <div className="relative pl-4 border-l-2 border-primary/20">
                <p className="text-muted-foreground text-sm leading-6">
                    {mystery.meditation}
                </p>
            </div>
          </CardContent>

          <Separator className="my-4 opacity-50" />

          <CardFooter className="pb-6 pt-0 flex flex-col gap-4">
            {isAcknowledged ? (
                 <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md h-12 text-sm font-medium transition-all" disabled>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Modlitwa potwierdzona
                 </Button>
            ) : (
                <Button 
                    onClick={handleAcknowledge} 
                    disabled={actionLoading}
                    className="w-full h-12 text-base font-semibold shadow-md transition-all active:scale-[0.98]"
                >
                    {actionLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <span className="flex items-center">
                            Potwierdzam modlitwę <ChevronRight className="ml-1 h-4 w-4 opacity-70" />
                        </span>
                    )}
                </Button>
            )}
            
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                 <Timer className="h-3 w-3" />
                 <span>Do zmiany tajemnic:</span>
                 <span className="font-mono font-medium tabular-nums text-foreground/80">
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                 </span>
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* --- MODAL MOJA RÓŻA --- */}
      <Dialog open={isRoseOpen} onOpenChange={setIsRoseOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
            <div className="p-6 pb-4 border-b bg-muted/20">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Flower2 className="h-5 w-5 text-rose-500" />
                        {profile?.groups?.name || "Moja Róża"}
                    </DialogTitle>
                    <DialogDescription>
                        Skład Twojej róży i aktualne tajemnice.
                    </DialogDescription>
                </DialogHeader>
            </div>

            {/* ZMIANA: Stylizacja paska scrolla (custom scrollbar) */}
            <div className="
                flex-1 overflow-y-auto min-h-0
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20
                [&::-webkit-scrollbar-thumb]:rounded-full
            ">
                {roseLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 gap-3 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" /> 
                        <span className="text-sm">Pobieranie danych róży...</span>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y">
                        {roseMembers.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                Brak danych. Upewnij się, że jesteś przypisany do grupy.
                            </div>
                        ) : (
                            roseMembers.map((member) => (
                                <div 
                                    key={member.id} 
                                    className={`flex items-center p-4 gap-3 transition-colors ${member.id === profile?.id ? "bg-primary/5" : "hover:bg-muted/50"}`}
                                >
                                    <div className="flex flex-col items-center justify-center h-8 w-8 min-w-[2rem] rounded-full bg-background border text-xs font-semibold text-muted-foreground shadow-sm">
                                        {member.rose_pos || "-"}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium truncate ${member.id === profile?.id ? "text-primary" : "text-foreground"}`}>
                                                {member.full_name}
                                            </span>
                                            {member.id === profile?.id && (
                                                <Badge variant="secondary" className="text-[10px] px-1 h-4">Ty</Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                                            <ScrollText className="h-3 w-3" />
                                            {member.current_mystery_name}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}