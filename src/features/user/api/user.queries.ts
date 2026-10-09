import { queryOptions, type QueryClient } from "@tanstack/react-query"
import { userService } from "@/features/user/api/user.service"
import { QUERY_KEYS } from "@/shared/lib/constants"

/**
 * Zapytania panelu użytkownika — wspólne dla useUserData i pobierania z wyprzedzeniem w AuthContext
 */
export const userQueries = {
  /** Profil z rolą i Różą — pobierany w AuthContext przy logowaniu, panel korzysta z cache */
  profile: (userId: string) => queryOptions({
    queryKey: QUERY_KEYS.PROFILE(userId),
    queryFn: () => userService.getProfile(userId),
  }),

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
 * Obraz tajemnicy z danych zapamiętanych w telefonie (queryPersistence) pobierany od razu przy starcie —
 * równolegle ze sprawdzaniem sesji, a nie dopiero po narysowaniu panelu.
 * Te same atrybuty co <img> w MysteryCard (crossOrigin), więc przeglądarka nie pobiera obrazu drugi raz.
 */
export function preloadCachedMysteryImage(queryClient: QueryClient) {
  for (const [, mysteryId] of queryClient.getQueriesData<number | null>({ queryKey: ['mystery-id'] })) {
    if (!mysteryId) continue
    const imageUrl = queryClient.getQueryData(userQueries.mystery(mysteryId).queryKey)?.image_url
    if (!imageUrl) continue

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = imageUrl
    link.fetchPriority = 'high'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
    return
  }
}

/**
 * Dane panelu pobierane równolegle z profilem, jeszcze przy ekranie ładowania.
 * Bez tego zapytania szły jedno po drugim: profil → ID tajemnicy → treść i status.
 * Przy danych zapamiętanych z poprzedniego uruchomienia (queryPersistence) to samo sprawdza je w tle.
 * Błędy pomijane — panel zapyta ponownie przez useUserData.
 */
export async function prefetchUserDashboard(queryClient: QueryClient, userId: string) {
  const intention = queryClient.prefetchQuery(userQueries.intention())
  const mysteryId = await queryClient.fetchQuery(userQueries.mysteryId(userId)).catch(() => null)
  if (mysteryId) {
    await Promise.all([
      // Treść raz na uruchomienie, mimo staleTime: Infinity — zapamiętana mogła się zmienić
      queryClient.prefetchQuery({ ...userQueries.mystery(mysteryId), staleTime: 0 }),
      queryClient.prefetchQuery(userQueries.acknowledgment(userId, mysteryId)),
    ])
  }
  await intention
}
