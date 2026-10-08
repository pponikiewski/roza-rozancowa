import { rosesService } from "@/features/admin/roses/api/roses.service"
import { groupsService } from "@/shared/api"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTypedMutation } from "@/shared/hooks"
import { QUERY_KEYS } from "@/shared/lib/constants"
import type { RoseAdmission } from "@/features/admin/roses/types/rose.types"

export function useAdminRoses() {
  const queryClient = useQueryClient()

  const { data: groups, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_ROSES,
    queryFn: () => groupsService.getAll()
  })

  const saveGroupMutation = useTypedMutation({
    mutationFn: async ({ name, id, admission }: { name: string; id?: number; admission: RoseAdmission }) => {
      if (id) {
        await rosesService.updateGroup(id, name, admission)
        return true // isEdit
      } else {
        await rosesService.createGroup(name, admission)
        return false // isEdit
      }
    },
    successMessage: (isEdit) => isEdit ? "Zaktualizowano Różę" : "Utworzono nową Różę",
    errorMessage: "Wystąpił błąd",
    // Nazwa Róży widnieje też na liście członków
    invalidateKeys: [QUERY_KEYS.ADMIN_ROSES, QUERY_KEYS.ADMIN_MEMBERS]
  })

  const deleteGroupMutation = useTypedMutation({
    mutationFn: (id: number) => rosesService.deleteGroup(id),
    successMessage: "Róża usunięta",
    errorMessage: "Błąd usuwania",
    invalidateKeys: [QUERY_KEYS.ADMIN_ROSES, QUERY_KEYS.ADMIN_MEMBERS],
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
    errorMessage: "Błąd rotacji",
    // Rotacja zmienia tajemnice i kasuje potwierdzenia — lista członków musi się odświeżyć
    invalidateKeys: [QUERY_KEYS.ADMIN_MEMBERS]
  })

  return {
    loading: isLoading,
    actionLoading: [saveGroupMutation, deleteGroupMutation, rotateGroupMutation].some(m => m.isPending),
    groups: groups || [],
    fetchGroups: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ROSES }),
    saveGroup: (name: string, id?: number, admission: RoseAdmission = null) =>
      saveGroupMutation.execute({ name, id, admission }),
    deleteGroup: deleteGroupMutation.execute,
    rotateGroup: rotateGroupMutation.execute,
  }
}
