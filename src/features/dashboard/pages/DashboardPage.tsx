import { useState } from "react"
// UI Components
import { LoadingScreen } from "@/shared/components/feedback"
import { IntentionCard } from "@/features/dashboard/components/IntentionCard"
import { MysteryCard } from "@/features/dashboard/components/MysteryCard"
import { RoseDialog } from "@/features/dashboard/components/RoseDialog"
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader"
import { NoAssignmentCard } from "@/features/dashboard/components/NoAssignmentCard"
// Hooks & Utils
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData"
import { useMysteryChangeTimer } from "@/features/dashboard/hooks/useMysteryChangeTimer"
import { dashboardService } from "@/features/dashboard/api/dashboard.service"
import { getErrorMessage } from "@/shared/lib/utils"
import { toast } from "sonner"
import type { RoseMember } from "@/features/dashboard/types/dashboard.types"

/** Główny komponent panelu użytkownika - wyświetla przydzieloną tajemnicę, intencję oraz podgląd Róży */
export default function DashboardPage() {
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
      const members = await dashboardService.getRoseMembers(profile.groups.id)
      setRoseMembers(members)
    } catch (err) {
      toast.error("Nie udało się pobrać danych Róży", {
        description: getErrorMessage(err)
      })
    } finally {
      setRoseLoading(false)
    }
  }

  if (loading) {
    return <LoadingScreen fullScreen text="Ładowanie..." className="bg-muted/30" />
  }

  if (!mystery) {
    return <NoAssignmentCard profile={profile} />
  }

  return (
    <div className="min-h-screen w-full bg-muted/20 flex flex-col pb-safe">
      <DashboardHeader profile={profile} onOpenRose={handleOpenRose} />

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