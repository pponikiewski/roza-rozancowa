import { useState, useEffect } from "react"
// UI Components
import { UserPageSkeleton } from "@/features/user/components/UserPageSkeleton"
import { IntentionCard } from "@/features/user/components/IntentionCard"
import { MysteryCard } from "@/features/user/components/MysteryCard"
import { RoseDialog } from "@/features/user/components/RoseDialog"
import { UserHeader } from "@/features/user/components/UserHeader"
import { NoAssignmentCard } from "@/features/user/components/NoAssignmentCard"
import { IndulgenceCard } from "@/features/user/components/IndulgenceCard"
// Hooks & Utils
import { useUserData } from "@/features/user/hooks/useUserData"
import { useMysteryChangeTimer } from "@/features/user/hooks/useMysteryChangeTimer"
import { userService } from "@/features/user/api/user.service"
import { getOptimizedImageUrl } from "@/shared/lib/utils"
import { useQuery } from "@tanstack/react-query"

/** Główny komponent panelu użytkownika - wyświetla przydzieloną tajemnicę, intencję oraz podgląd Róży */
export default function UserPage() {
  // Custom hooks
  const {
    loading,
    actionLoading,
    profile,
    mystery,
    intention,
    isAcknowledged,
    todayIndulgences,
    acknowledgeMystery
  } = useUserData()

  const { timeLeft } = useMysteryChangeTimer()

  const [isRoseOpen, setIsRoseOpen] = useState(false)

  // Preload LCP image as soon as mystery data is available
  useEffect(() => {
    if (mystery?.image_url) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.setAttribute('imagesrcset', [
        `${getOptimizedImageUrl(mystery.image_url, 300)} 300w`,
        `${getOptimizedImageUrl(mystery.image_url, 500)} 500w`,
        `${getOptimizedImageUrl(mystery.image_url, 800)} 800w`,
      ].join(', '))
      link.setAttribute('imagesizes', '(max-width: 550px) 90vw, 500px')
      link.fetchPriority = 'high'
      document.head.appendChild(link)
      return () => { document.head.removeChild(link) }
    }
  }, [mystery?.image_url])

  const { data: roseMembers = [], isLoading: roseLoading } = useQuery({
    queryKey: ["rose-members", profile?.groups?.id],
    queryFn: () => userService.getRoseMembers(profile!.groups!.id),
    enabled: isRoseOpen && !!profile?.groups?.id,
  })

  if (loading) {
    return <UserPageSkeleton />
  }

  if (!mystery) {
    return <NoAssignmentCard profile={profile} />
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col pb-safe">
      <UserHeader profile={profile} onOpenRose={() => setIsRoseOpen(true)} />

      <main className="flex-1 w-full max-w-lg mx-auto px-5 py-2 md:px-8 md:py-4 flex flex-col divide-y">
        {/* KARTA ODPUSTU — tylko w dniu odpustu */}
        {todayIndulgences.length > 0 && <IndulgenceCard indulgences={todayIndulgences} />}

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
        fullName={profile?.full_name}
        login={profile?.login}
        groupName={profile?.groups?.name}
        members={roseMembers}
        loading={roseLoading}
        currentUserId={profile?.id}
      />
    </div>
  )
}