import { queryOptions, type QueryClient } from "@tanstack/react-query"
import { userService } from "@/features/user/api/user.service"
import { QUERY_KEYS } from "@/shared/lib/constants"

/**
 * Zapytania panelu użytkownika — wspólne dla useUserData i pobierania z wyprzedzeniem w AuthContext
 */
export const userQueries = {
  intention: () => queryOptions({
    queryKey: QUERY_KEYS.INTENTION,
    queryFn: () => userService.getCurrentIntention(),
  }),

  /** ID tajemnicy — od niego zależą treść tajemnicy i status potwierdzenia */
  mysteryId: (userId: string) => queryOptions({
    queryKey: QUERY_KEYS.MYSTERY_ID(userId),
    queryFn: () => userService.getMysteryId(userId),
  }),

  /** Treść tajemnicy — stała, nie trzeba jej odświeżać */
  mystery: (mysteryId: number) => queryOptions({
    queryKey: QUERY_KEYS.MYSTERY(mysteryId),
    queryFn: () => userService.getMystery(mysteryId),
    staleTime: Infinity,
  }),

  acknowledgment: (userId: string, mysteryId: number) => queryOptions({
    queryKey: QUERY_KEYS.ACKNOWLEDGMENT(userId, mysteryId),
    queryFn: () => userService.checkAcknowledgment(mysteryId),
  }),
}

/**
 * Dane panelu pobierane równolegle z profilem, jeszcze przy ekranie ładowania.
 * Bez tego zapytania szły jedno po drugim: profil → ID tajemnicy → treść i status.
 * Błędy pomijane — panel zapyta ponownie przez useUserData.
 */
export async function prefetchUserDashboard(queryClient: QueryClient, userId: string) {
  const intention = queryClient.prefetchQuery(userQueries.intention())
  const mysteryId = await queryClient.fetchQuery(userQueries.mysteryId(userId)).catch(() => null)
  if (mysteryId) {
    await Promise.all([
      queryClient.prefetchQuery(userQueries.mystery(mysteryId)),
      queryClient.prefetchQuery(userQueries.acknowledgment(userId, mysteryId)),
    ])
  }
  await intention
}
