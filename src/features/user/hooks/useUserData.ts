import { userService } from "@/features/user/api/user.service"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/features/auth/context/AuthContext"
import { QUERY_KEYS } from "@/shared/lib/constants"
import { toast } from "sonner"

/**
 * Hook do pobierania danych dla panelu użytkownika
 * 
 * Pobiera:
 * - Profil użytkownika
 * - Intencję na ten miesiąc
 * - Przydzieloną tajemnicę
 * - Status potwierdzenia tajemnicy
 * 
 * @returns User data
 */
export function useUserData() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  // 1. Profil — zwykle już w cache (AuthContext pobiera go przy logowaniu razem z rolą)
  const { data: profile, isLoading: profileLoading } = useQuery({
     queryKey: QUERY_KEYS.PROFILE(user?.id || ''),
     queryFn: () => userService.getProfile(user!.id),
     enabled: !!user
  })

  // 2. Intencja
  const { data: intention, isLoading: intentionLoading } = useQuery({
     queryKey: QUERY_KEYS.INTENTION,
     queryFn: () => userService.getCurrentIntention()
  })

  // 3. ID tajemnicy — od niego zależą treść tajemnicy i status potwierdzenia
  const { data: mysteryId, isLoading: mysteryIdLoading } = useQuery({
      queryKey: QUERY_KEYS.MYSTERY_ID(user?.id || ''),
      queryFn: () => userService.getMysteryId(user!.id),
      enabled: !!user
  })

  // 4a. Treść tajemnicy — stała, nie trzeba jej odświeżać
  const { data: mystery, isLoading: mysteryLoading } = useQuery({
      queryKey: QUERY_KEYS.MYSTERY(mysteryId ?? 0),
      queryFn: () => userService.getMystery(mysteryId!),
      enabled: !!mysteryId,
      staleTime: Infinity
  })

  // 4b. Status potwierdzenia — równolegle z treścią tajemnicy
  const { data: isAcknowledged, isLoading: ackLoading } = useQuery({
      queryKey: QUERY_KEYS.ACKNOWLEDGMENT(user?.id || '', mysteryId ?? 0),
      queryFn: () => userService.checkAcknowledgment(mysteryId!),
      enabled: !!user && !!mysteryId
  })

  // 5. Dzisiejsze odpusty (nie blokują ładowania panelu)
  const todayKey = new Date().toDateString()
  const group = profile?.groups ?? null
  const { data: todayIndulgences } = useQuery({
      queryKey: [...QUERY_KEYS.INDULGENCES_TODAY(todayKey), group?.id ?? null],
      queryFn: () => userService.getTodayIndulgences(group),
      enabled: !!user && !profileLoading
  })

  // Mutation for acknowledgment
  const mutation = useMutation({
      mutationFn: async () => {
          if (!user || !mystery) return
          // Artificial delay for better UX
          await new Promise(resolve => setTimeout(resolve, 300))
          await userService.acknowledgeMystery(mystery.id)
      },
      onSuccess: () => {
          // Invalidate acknowledgment query to refetch and update UI to "true"
          queryClient.invalidateQueries({ queryKey: ['acknowledgment'] })
      },
      onError: (error: Error) => {
          toast.error("Błąd", { description: error.message })
      }
  })

  // Consolidated loading state
  const isLoading = authLoading || profileLoading || mysteryIdLoading || mysteryLoading || ackLoading || intentionLoading

  return {
    loading: isLoading,
    actionLoading: mutation.isPending,
    profile: profile || null,
    mystery: mystery || null,
    intention: intention || null,
    isAcknowledged: !!isAcknowledged,
    todayIndulgences: todayIndulgences || [],
    acknowledgeMystery: mutation.mutate
  }
}
