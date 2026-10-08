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
import { userService } from "@/features/user/api/user.service"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "@/shared/lib/constants"
import type { RoseMember } from "@/features/user/types/user.types"

// Stała pusta lista — nowa tablica przy każdym renderze psułaby memo w RoseDialog
const NO_MEMBERS: RoseMember[] = []

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

  const [isRoseOpen, setIsRoseOpen] = useState(false)

  // Obraz tajemnicy pobierany od razu, gdy znany jest adres (zanim zniknie szkielet strony)
  useEffect(() => {
    if (mystery?.image_url) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = mystery.image_url
      link.fetchPriority = 'high'
      // Ten sam tryb co <img> w MysteryCard — inaczej przeglądarka pobrałaby obraz drugi raz
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
      return () => { document.head.removeChild(link) }
    }
  }, [mystery?.image_url])

  const { data: roseMembers = NO_MEMBERS, isLoading: roseLoading } = useQuery({
    queryKey: QUERY_KEYS.ROSE_MEMBERS(profile?.groups?.id ?? 0),
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