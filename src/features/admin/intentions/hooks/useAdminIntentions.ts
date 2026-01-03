import { useState } from "react"
import { intentionsService } from "@/features/admin/intentions/api/intentions.service"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getErrorMessage } from "@/shared/lib/utils"
import { QUERY_KEYS } from "@/shared/lib/constants"

export function useAdminIntentions() {
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)

  const { data: history, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_INTENTIONS_HISTORY,
    queryFn: () => intentionsService.getIntentionsHistory()
  })

  const saveMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      await intentionsService.saveIntention(title, content)
    },
    onSuccess: () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      toast.success("Intencja zapisana")
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_INTENTIONS_HISTORY })
    },
    onError: (err) => toast.error("Błąd zapisu", { description: getErrorMessage(err) })
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: number; title: string; content: string }) => {
      await intentionsService.updateIntention(id, title, content)
    },
    onSuccess: () => {
      toast.success("Intencja zaktualizowana")
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_INTENTIONS_HISTORY })
    },
    onError: (err) => toast.error("Błąd aktualizacji", { description: getErrorMessage(err) })
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await intentionsService.deleteIntention(id)
    },
    onSuccess: () => {
      toast.success("Intencja usunięta")
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_INTENTIONS_HISTORY })
    },
    onError: (err) => toast.error("Błąd usuwania", { description: getErrorMessage(err) })
  })

  const saveIntention = async (title: string, content: string) => {
    try {
      await saveMutation.mutateAsync({ title, content })
      return true
    } catch {
      return false
    }
  }

  const updateIntention = async (id: number, title: string, content: string) => {
    try {
      await updateMutation.mutateAsync({ id, title, content })
      return true
    } catch {
      return false
    }
  }

  const deleteIntention = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      return true
    } catch {
      return false
    }
  }

  return {
    loading: isLoading,
    history: history || [],
    saved,
    saveIntention,
    updateIntention,
    deleteIntention
  }
}
