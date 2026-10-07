import { useQuery } from "@tanstack/react-query"
import { indulgencesService } from "@/features/admin/indulgences/api/indulgences.service"
import { useTypedMutation } from "@/shared/hooks"
import { QUERY_KEYS } from "@/shared/lib/constants"
import type { IndulgenceInput } from "@/features/admin/indulgences/types/indulgence.types"

export function useAdminIndulgences() {
  const { data: indulgences, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_INDULGENCES,
    queryFn: () => indulgencesService.getIndulgences()
  })

  const createMutation = useTypedMutation({
    mutationFn: (input: IndulgenceInput) => indulgencesService.createIndulgence(input),
    successMessage: "Dzień odpustu dodany",
    errorMessage: "Błąd zapisu",
    invalidateKeys: [QUERY_KEYS.ADMIN_INDULGENCES]
  })

  const updateMutation = useTypedMutation({
    mutationFn: ({ id, input }: { id: number; input: IndulgenceInput }) =>
      indulgencesService.updateIndulgence(id, input),
    successMessage: "Dzień odpustu zaktualizowany",
    errorMessage: "Błąd aktualizacji",
    invalidateKeys: [QUERY_KEYS.ADMIN_INDULGENCES]
  })

  const deleteMutation = useTypedMutation({
    mutationFn: (id: number) => indulgencesService.deleteIndulgence(id),
    successMessage: "Dzień odpustu usunięty",
    errorMessage: "Błąd usuwania",
    invalidateKeys: [QUERY_KEYS.ADMIN_INDULGENCES]
  })

  return {
    loading: isLoading,
    saving: createMutation.isPending || updateMutation.isPending,
    indulgences: indulgences || [],
    createIndulgence: createMutation.execute,
    updateIndulgence: (id: number, input: IndulgenceInput) => updateMutation.execute({ id, input }),
    deleteIndulgence: deleteMutation.execute,
  }
}
