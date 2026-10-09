import { dehydrate, hydrate, type DehydratedState, type QueryClient } from '@tanstack/react-query'

/**
 * Dane panelu użytkownika zapamiętane w telefonie między uruchomieniami aplikacji.
 *
 * Bez tego każde otwarcie czekało na dwie rundy zapytań (ID tajemnicy → treść i status), zanim
 * pokazało cokolwiek poza szkieletem. Teraz panel od razu pokazuje ostatnie dane, a AuthContext
 * (prefetchUserDashboard) sprawdza je w tle i podmienia, jeśli coś się zmieniło.
 *
 * Bez @tanstack/query-*-persister: ich wersje wymagają innej wersji query-core (druga kopia w paczce).
 */

const STORAGE_KEY = 'roza-query-cache'
/** Podnieś przy zmianie kształtu zapisywanych danych — stary zapis zostanie odrzucony */
const CACHE_VERSION = 1
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const SAVE_DELAY_MS = 1000

/** Zapisywane zapytania (pierwszy element klucza z QUERY_KEYS) — tylko to, co potrzebne na start panelu */
const PERSISTED_KEYS = new Set(['profile', 'intention', 'mystery-id', 'mystery', 'acknowledgment', 'indulgences-today'])

interface SavedCache {
  version: number
  savedAt: number
  state: DehydratedState
}

/**
 * Początek bieżącego okresu tajemnic: pierwsza niedziela miesiąca, liczona jak w bazie
 * (current_mystery_period_start, now() w UTC)
 */
function mysteryPeriodStart(now: Date): number {
  const firstSunday = (year: number, month: number) => {
    const first = new Date(Date.UTC(year, month, 1))
    return Date.UTC(year, month, 1 + ((7 - first.getUTCDay()) % 7))
  }
  const thisMonth = firstSunday(now.getUTCFullYear(), now.getUTCMonth())
  return now.getTime() >= thisMonth ? thisMonth : firstSunday(now.getUTCFullYear(), now.getUTCMonth() - 1)
}

/**
 * Dane z poprzedniego okresu nie trafiają na ekran nawet na chwilę — w dniu zmiany tajemnic
 * panel pokazuje szkielet zamiast starej tajemnicy
 */
function isOutdated(queryKey: readonly unknown[], dataUpdatedAt: number, now: Date): boolean {
  switch (queryKey[0]) {
    case 'mystery-id':
    case 'acknowledgment':
      return dataUpdatedAt < mysteryPeriodStart(now)
    case 'intention': {
      const fetched = new Date(dataUpdatedAt)
      return fetched.getMonth() !== now.getMonth() || fetched.getFullYear() !== now.getFullYear()
    }
    case 'indulgences-today':
      return queryKey[1] !== now.toDateString()
    default:
      return false
  }
}

/** Wczytanie zapisanych danych do cache — przed pierwszym renderem, więc panel ma je od razu */
export function restoreQueryCache(queryClient: QueryClient) {
  let saved: SavedCache | null = null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    saved = raw ? (JSON.parse(raw) as SavedCache) : null
  } catch {
    // Brak dostępu do localStorage lub uszkodzony zapis — start bez zapamiętanych danych
  }
  if (!saved || saved.version !== CACHE_VERSION || Date.now() - saved.savedAt > MAX_AGE_MS) return

  const now = new Date()
  hydrate(queryClient, {
    ...saved.state,
    queries: saved.state.queries.filter(
      (query) => !isOutdated(query.queryKey, query.state.dataUpdatedAt, now)
    ),
  })
}

/** Zapisywanie danych panelu po każdej zmianie (najwyżej raz na sekundę) */
export function persistQueryCache(queryClient: QueryClient) {
  let timer: ReturnType<typeof setTimeout> | undefined

  const save = () => {
    timer = undefined
    try {
      const state = dehydrate(queryClient, {
        shouldDehydrateQuery: (query) =>
          query.state.status === 'success' && PERSISTED_KEYS.has(String(query.queryKey[0])),
      })
      const saved: SavedCache = { version: CACHE_VERSION, savedAt: Date.now(), state }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      // Pełny lub niedostępny localStorage — aplikacja działa dalej, tylko bez zapamiętanych danych
    }
  }

  return queryClient.getQueryCache().subscribe((event) => {
    if (!PERSISTED_KEYS.has(String(event.query.queryKey[0]))) return
    timer ??= setTimeout(save, SAVE_DELAY_MS)
  })
}
