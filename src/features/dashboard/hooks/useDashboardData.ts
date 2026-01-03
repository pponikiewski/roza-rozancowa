import { dashboardService } from "@/features/dashboard/api/dashboard.service"
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
 * @returns Dashboard data
 */
export function useDashboardData() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  // 1. Fetch Profile
  const { data: profile, isLoading: profileLoading } = useQuery({
     queryKey: QUERY_KEYS.PROFILE(user?.id || ''),
     queryFn: () => dashboardService.getProfile(user!.id),
     enabled: !!user
  })

  // 2. Fetch Intention
  const { data: intention, isLoading: intentionLoading } = useQuery({
     queryKey: QUERY_KEYS.INTENTION,
     queryFn: () => dashboardService.getCurrentIntention()
  })

  // 3. Fetch Mystery with logic
  const { data: mystery, isLoading: mysteryLoading } = useQuery({
      queryKey: QUERY_KEYS.MYSTERY(user?.id || ''),
      queryFn: () => dashboardService.getUserMystery(user!.id),
      enabled: !!user
  })

  // 4. Check Acknowledgment
  const { data: isAcknowledged, isLoading: ackLoading } = useQuery({
      queryKey: QUERY_KEYS.ACKNOWLEDGMENT(user?.id || '', mystery?.id || 0),
      queryFn: () => dashboardService.checkAcknowledgment(user!.id, mystery!.id),
      enabled: !!user && !!mystery
  })

  // Mutation for acknowledgment
  const mutation = useMutation({
      mutationFn: async () => {
          if (!user || !mystery) return
          // Artificial delay for better UX
          await new Promise(resolve => setTimeout(resolve, 300))
          await dashboardService.acknowledgeMystery(user.id, mystery.id)
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
  const isLoading = authLoading || profileLoading || mysteryLoading || ackLoading || intentionLoading

  return {
    loading: isLoading,
    actionLoading: mutation.isPending,
    profile: profile || null,
    mystery: mystery || null,
    intention: intention || null,
    isAcknowledged: !!isAcknowledged,
    acknowledgeMystery: mutation.mutate
  }
}
