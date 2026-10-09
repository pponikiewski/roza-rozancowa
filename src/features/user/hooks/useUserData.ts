import { userService } from "@/features/user/api/user.service"
import { userQueries } from "@/features/user/api/user.queries"
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

  // Aplikacja na telefonie potrafi wisieć w tle wiele dni — po powrocie do niej odśwież
  // dane, które zmieniają się w czasie (tajemnica w 1. niedzielę, intencja, odpusty).
  // Tylko gdy są starsze niż staleTime (5 min), więc bez zbędnych zapytań.
  const refreshOnReturn = { refetchOnWindowFocus: true } as const

  // 1. Profil — zwykle już w cache (AuthContext pobiera go przy logowaniu razem z rolą)
  const { data: profile, isLoading: profileLoading } = useQuery({
     ...userQueries.profile(user?.id || ''),
     enabled: !!user
  })

  // 2. Intencja
  const { data: intention, isLoading: intentionLoading } = useQuery({
     ...userQueries.intention(),
     ...refreshOnReturn
  })

  // 3. ID tajemnicy — od niego zależą treść tajemnicy i status potwierdzenia
  const { data: mysteryId, isLoading: mysteryIdLoading } = useQuery({
      ...userQueries.mysteryId(user?.id || ''),
      enabled: !!user,
      ...refreshOnReturn
  })

  // 4a. Treść tajemnicy — stała, nie trzeba jej odświeżać
  const { data: mystery, isLoading: mysteryLoading } = useQuery({
      ...userQueries.mystery(mysteryId ?? 0),
      enabled: !!mysteryId
  })

  // 4b. Status potwierdzenia — równolegle z treścią tajemnicy
  const { data: isAcknowledged, isLoading: ackLoading } = useQuery({
      ...userQueries.acknowledgment(user?.id || '', mysteryId ?? 0),
      enabled: !!user && !!mysteryId,
      ...refreshOnReturn
  })

  // 5. Dzisiejsze odpusty (nie blokują ładowania panelu)
  const todayKey = new Date().toDateString()
  const group = profile?.groups ?? null
  const { data: todayIndulgences } = useQuery({
      queryKey: [...QUERY_KEYS.INDULGENCES_TODAY(todayKey), group?.id ?? null],
      queryFn: () => userService.getTodayIndulgences(group),
      enabled: !!user && !profileLoading,
      // Zapamiętane z poprzedniego uruchomienia (queryPersistence) — sprawdzane przy starcie, jeśli starsze niż 5 min
      refetchOnMount: true,
      ...refreshOnReturn
  })

  // Potwierdzenie tajemnicy — po sukcesie status ustawiany od razu, bez ponownego zapytania
  const mutation = useMutation({
      mutationFn: async () => {
          if (!user || !mystery) return
          await userService.acknowledgeMystery(mystery.id)
      },
      onSuccess: () => {
          if (!user || !mystery) return
          queryClient.setQueryData(QUERY_KEYS.ACKNOWLEDGMENT(user.id, mystery.id), true)
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
