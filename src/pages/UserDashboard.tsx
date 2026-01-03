import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle, LogOut, Loader2, Users } from "lucide-react"
// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { HeaderControls } from "@/components/header-controls"
import { IntentionCard } from "@/components/dashboard/IntentionCard"
import { MysteryCard } from "@/components/dashboard/MysteryCard"
import { RoseDialog } from "@/components/dashboard/RoseDialog"
// Hooks & Utils
import { useDashboardData } from "@/hooks/useDashboardData"
import { useMysteryChangeTimer } from "@/hooks/useMysteryChangeTimer"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { getErrorMessage } from "@/lib/utils"
import { toast } from "sonner"
import type { RoseMember } from "@/types"

/** Główny komponent panelu użytkownika - wyświetla przydzieloną tajemnicę, intencję oraz podgląd Róży */
export default function UserDashboard() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

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
      toast.error("Nie udało się pobrać danych Róży", {
        description: getErrorMessage(err)
      })
    } finally {
      setRoseLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      navigate("/login")
    } catch (e) {
      toast.error("Błąd wylogowania")
      navigate("/login")
    }
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
        {/* KARTA INTENCJI */}
        {intention && (
          <IntentionCard
            title={intention.title}
            content={intention.content}
            month={new Date().toLocaleString("pl-PL", { month: "long" })}
          />
        )}

        {/* KARTA TAJEMNICY */}
        <MysteryCard
          mystery={mystery}
          isAcknowledged={isAcknowledged}
          actionLoading={actionLoading}
          timeLeft={timeLeft}
          onAcknowledge={acknowledgeMystery}
        />
      </main>

      {/* DIALOG RÓŻY */}
      <RoseDialog
        open={isRoseOpen}
        onOpenChange={setIsRoseOpen}
        groupName={profile?.groups?.name}
        members={roseMembers}
        loading={roseLoading}
        currentUserId={profile?.id}
      />
    </div>
  )
}