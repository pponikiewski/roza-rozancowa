import { rosesService } from "@/features/admin/roses/api/roses.service"
import { toast } from "sonner"
import { getErrorMessage } from "@/shared/lib/utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTypedMutation } from "@/shared/hooks"
import { QUERY_KEYS } from "@/shared/lib/constants"

export function useAdminRoses() {
  const queryClient = useQueryClient()

  const { data: groups, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_ROSES,
    queryFn: () => rosesService.getAllGroups()
  })

  const saveGroupMutation = useTypedMutation({
    mutationFn: async ({ name, id }: { name: string; id?: number }) => {
      if (id) {
        await rosesService.updateGroup(id, name)
        return true // isEdit
      } else {
        await rosesService.createGroup(name)
        return false // isEdit
      }
    },
    successMessage: (isEdit) => isEdit ? "Zaktualizowano nazwę Róży" : "Utworzono nową Różę",
    errorMessage: "Wystąpił błąd",
    invalidateKeys: [QUERY_KEYS.ADMIN_ROSES]
  })

  const deleteGroupMutation = useTypedMutation({
    mutationFn: (id: number) => rosesService.deleteGroup(id),
    successMessage: "Róża usunięta",
    errorMessage: "Błąd usuwania",
    invalidateKeys: [QUERY_KEYS.ADMIN_ROSES],
    onErrorCallback: (err: unknown) => {
      const error = err as { code?: string; message?: string }
      if (error.code === '23503') {
        toast.error("Nie można usunąć (grupa ma członków)", { description: error.message })
      }
    }
  })

  const rotateGroupMutation = useTypedMutation({
    mutationFn: (id: number) => rosesService.rotateGroup(id),
    successMessage: "Rotacja zakończona pomyślnie!",
    errorMessage: "Błąd rotacji"
  })

  return {
    loading: isLoading,
    actionLoading: saveGroupMutation.isPending || deleteGroupMutation.isPending || rotateGroupMutation.isPending,
    groups: groups || [],
    fetchGroups: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ROSES }),
    saveGroup: (name: string, id?: number) => saveGroupMutation.execute({ name, id }),
    deleteGroup: (id: number) => deleteGroupMutation.execute(id),
    rotateGroup: (id: number) => rotateGroupMutation.execute(id)
  }
}
}
