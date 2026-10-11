import { useEffect, useState } from "react"
import { intentionsService } from "@/features/admin/intentions/api/intentions.service"
import { useQuery } from "@tanstack/react-query"
import { useTypedMutation } from "@/shared/hooks"
import { QUERY_KEYS } from "@/shared/lib/constants"

const MONTH_CHECK_INTERVAL_MS = 60_000

function getCurrentPeriod() {
  const date = new Date()
  return { month: date.getMonth() + 1, year: date.getFullYear() }
}

/**
 * Bieżący miesiąc i rok. Sprawdzane co minutę — przy otwartej stronie na przełomie miesięcy
 * formularz przechodzi na nowy miesiąc bez odświeżania
 */
function useCurrentPeriod() {
  const [period, setPeriod] = useState(getCurrentPeriod)

  useEffect(() => {
    const id = setInterval(() => {
      setPeriod((prev) => {
        const next = getCurrentPeriod()
        return next.month === prev.month && next.year === prev.year ? prev : next
      })
    }, MONTH_CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return period
}

export function useAdminIntentions() {
  const [saved, setSaved] = useState(false)
  const { month, year } = useCurrentPeriod()

  const { data: history, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_INTENTIONS_HISTORY,
    queryFn: () => intentionsService.getIntentionsHistory()
  })

  // Intencja na bieżący miesiąc (zapis to upsert po miesiącu i roku, więc najwyżej jedna)
  const currentIntention = history?.find((i) => i.month === month && i.year === year) ?? null

  const saveMutation = useTypedMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      intentionsService.saveIntention(title, content),
    successMessage: "Intencja zapisana",
    errorMessage: "Błąd zapisu",
    invalidateKeys: [QUERY_KEYS.ADMIN_INTENTIONS_HISTORY],
    onSuccessCallback: () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  })

  const updateMutation = useTypedMutation({
    mutationFn: ({ id, title, content }: { id: number; title: string; content: string }) =>
      intentionsService.updateIntention(id, title, content),
    successMessage: "Intencja zaktualizowana",
    errorMessage: "Błąd aktualizacji",
    invalidateKeys: [QUERY_KEYS.ADMIN_INTENTIONS_HISTORY]
  })

  const deleteMutation = useTypedMutation({
    mutationFn: (id: number) => intentionsService.deleteIntention(id),
    successMessage: "Intencja usunięta",
    errorMessage: "Błąd usuwania",
    invalidateKeys: [QUERY_KEYS.ADMIN_INTENTIONS_HISTORY]
  })

  return {
    loading: isLoading,
    history: history || [],
    month,
    year,
    currentIntention,
    saved,
    saveIntention: (title: string, content: string) => saveMutation.execute({ title, content }),
    updateIntention: (id: number, title: string, content: string) => updateMutation.execute({ id, title, content }),
    deleteIntention: deleteMutation.execute,
  }
}
