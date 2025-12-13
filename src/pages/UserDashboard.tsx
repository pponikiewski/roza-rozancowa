import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, AlertCircle, LogOut, Timer, ChevronRight, Loader2, Users, Rose, ScrollText } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getErrorMessage, getOptimizedImageUrl } from "@/lib/utils"
// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { HeaderControls } from "@/components/header-controls"
import { ResizableText } from "@/components/resizable-text"
// Hooks & Types
import { useDashboardData } from "@/hooks/useDashboardData"
import { useMysteryChangeTimer } from "@/hooks/useMysteryChangeTimer"
import type { RoseMember } from "@/types"

/** Główny komponent panelu użytkownika - wyświetla przydzieloną tajemnicę, intencję oraz podgląd Róży */
export default function UserDashboard() {
  const navigate = useNavigate()

  // Custom hooks
  const {
    loading,
    actionLoading,
    profile,
    mystery,
    intention,
    isAcknowledged,
    acknowledgeMystery
  } = useDashboardData()

  const { timeLeft } = useMysteryChangeTimer()

  const [isRoseOpen, setIsRoseOpen] = useState(false)
  const [roseMembers, setRoseMembers] = useState<RoseMember[]>([])
  const [roseLoading, setRoseLoading] = useState(false)

  /** Pobiera listę członków róży i ich tajemnice */
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
      console.error("Błąd pobierania róży:", getErrorMessage(err))
    } finally {
      setRoseLoading(false)
    }
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
            Witaj, <span className="font-medium text-foreground">{profile?.full_name}</span>.<br />
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
      <header className="app-header sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-2 shadow-sm">
        <div
          className="header-user-info flex items-center gap-3 cursor-pointer p-1.5 -ml-1.5 rounded-lg hover:bg-muted/60 transition-colors group select-none min-w-0 flex-1"
          onClick={handleOpenRose}
          title="Kliknij, aby zobaczyć swoją Różę"
        >
          <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/10 group-hover:border-primary/40 transition-colors flex items-center justify-center bg-primary/5 flex-shrink-0">
            <img src="/roseb.svg" alt="Logo" className="h-6 w-6 object-contain" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold leading-none flex items-center gap-1.5 truncate">
              <span className="truncate">{profile?.full_name}</span>
              <Users className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 font-medium group-hover:text-foreground transition-colors truncate">
              {profile?.groups?.name || "Brak grupy"}
            </span>
          </div>
        </div>
        <HeaderControls className="flex-shrink-0" />
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto p-8 md:p-8 flex flex-col gap-5">
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
              <ResizableText className="text-sm text-muted-foreground/90 italic leading-relaxed">
                "{intention.content}"
              </ResizableText>
            </div>
          </div>
        )}

        <Card className="overflow-hidden shadow-lg border-border/60">
          <div className="w-full bg-black/5 dark:bg-black/20 flex items-center justify-center p-4">
            {mystery.image_url ? (
              <img
                src={getOptimizedImageUrl(mystery.image_url, 800)}
                srcSet={`
                   ${getOptimizedImageUrl(mystery.image_url, 300)} 300w,
                   ${getOptimizedImageUrl(mystery.image_url, 500)} 500w,
                   ${getOptimizedImageUrl(mystery.image_url, 800)} 800w
                 `}
                sizes="(max-width: 550px) 90vw, 500px"
                alt={mystery.name}
                fetchPriority="high"
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
              <ResizableText className="text-muted-foreground text-sm leading-6">
                {mystery.meditation}
              </ResizableText>
            </div>
          </CardContent>

          <Separator className="my-4 opacity-50" />

          <CardFooter className="pb-6 pt-0 flex flex-col gap-4">
            {isAcknowledged ? (
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md h-12 text-sm font-medium transition-all" disabled>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Potwierdzone
              </Button>
            ) : (
              <Button
                onClick={acknowledgeMystery}
                disabled={actionLoading}
                className="w-full h-12 text-base font-semibold shadow-md transition-all active:scale-[0.98]"
              >
                {actionLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    Zapoznałem się z tajemnicą <ChevronRight className="ml-1 h-4 w-4 opacity-70" />
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

      <Dialog open={isRoseOpen} onOpenChange={setIsRoseOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <div className="p-6 pb-4 border-b bg-muted/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rose className="h-5 w-5 text-rose-500" />
                {profile?.groups?.name || "Moja Róża"}
              </DialogTitle>
              <DialogDescription>
                Skład Twojej róży i aktualne tajemnice.
              </DialogDescription>
            </DialogHeader>
          </div>

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