import { rosesService } from "@/features/admin/roses/api/roses.service"
import { toast } from "sonner"
import { getErrorMessage } from "@/shared/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "@/shared/lib/constants"

export function useAdminRoses() {
  const queryClient = useQueryClient()

  const { data: groups, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_ROSES,
    queryFn: () => rosesService.getAllGroups()
  })

  const saveGroupMutation = useMutation({
    mutationFn: async ({ name, id }: { name: string; id?: number }) => {
      if (id) {
        await rosesService.updateGroup(id, name)
        return true
      } else {
        await rosesService.createGroup(name)
        return false
      }
    },
    onSuccess: (isEdit) => {
      toast.success(isEdit ? "Zaktualizowano nazwę Róży" : "Utworzono nową Różę")
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ROSES })
    },
    onError: (err) => toast.error("Wystąpił błąd", { description: getErrorMessage(err) })
  })

  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => rosesService.deleteGroup(id),
    onSuccess: () => {
      toast.success("Róża usunięta")
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ROSES })
    },
    onError: (err: unknown) => {
      const error = err as { code?: string; message?: string }
      const msg = error.code === '23503' ? "Nie można usunąć (grupa ma członków)" : "Błąd usuwania"
      toast.error(msg, { description: error.message })
    }
  })

  const rotateGroupMutation = useMutation({
    mutationFn: (id: number) => rosesService.rotateGroup(id),
    onSuccess: () => toast.success("Rotacja zakończona pomyślnie!"),
    onError: (err) => toast.error("Błąd rotacji", { description: getErrorMessage(err) })
  })

  return {
    loading: isLoading,
    actionLoading: saveGroupMutation.isPending || deleteGroupMutation.isPending || rotateGroupMutation.isPending,
    groups: groups || [],
    fetchGroups: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ROSES }),
    saveGroup: async (name: string, id?: number) => {
      try {
        await saveGroupMutation.mutateAsync({ name, id })
        return true
      } catch {
        return false
      }
    },
    deleteGroup: async (id: number) => {
      try {
        await deleteGroupMutation.mutateAsync(id)
        return true
      } catch {
        return false
      }
    },
    rotateGroup: async (id: number) => {
      try {
        await rotateGroupMutation.mutateAsync(id)
        return true
      } catch {
        return false
      }
    }
  }
}
