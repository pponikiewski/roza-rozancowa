import { useState } from "react"
import { intentionsService } from "@/features/admin/intentions/api/intentions.service"
import { useQuery } from "@tanstack/react-query"
import { useTypedMutation } from "@/shared/hooks"
import { QUERY_KEYS } from "@/shared/lib/constants"

export function useAdminIntentions() {
  const [saved, setSaved] = useState(false)

  const { data: history, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_INTENTIONS_HISTORY,
    queryFn: () => intentionsService.getIntentionsHistory()
  })

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
    saved,
    saveIntention: (title: string, content: string) => saveMutation.execute({ title, content }),
    updateIntention: (id: number, title: string, content: string) => updateMutation.execute({ id, title, content }),
    deleteIntention: (id: number) => deleteMutation.execute(id)
  }
}
