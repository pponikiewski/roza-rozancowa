import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useAdminRoses() {
  const queryClient = useQueryClient()

  const { data: groups, isLoading } = useQuery({
      queryKey: ['admin_groups'],
      queryFn: async () => {
          const { data, error } = await supabase.from('groups').select('*').order('id', { ascending: true })
          if (error) {
              toast.error("Błąd pobierania grup", { description: error.message })
              return []
          }
          return data || []
      }
  })

  const saveGroupMutation = useMutation({
      mutationFn: async ({ name, id }: { name: string, id?: number }) => {
          if (!name.trim()) throw new Error("Nazwa wymagana")
          
          const query = id 
            ? supabase.from('groups').update({ name }).eq('id', id)
            : supabase.from('groups').insert({ name })
          
          const { error } = await query
          if (error) throw error
          return !!id
      },
      onSuccess: (isEdit) => {
          toast.success(isEdit ? "Zaktualizowano nazwę Róży" : "Utworzono nową Różę")
          queryClient.invalidateQueries({ queryKey: ['admin_groups'] })
      },
      onError: (err) => toast.error("Wystąpił błąd", { description: getErrorMessage(err) })
  })

  const deleteGroupMutation = useMutation({
      mutationFn: async (id: number) => {
          const { error } = await supabase.from('groups').delete().eq('id', id)
          if (error) throw error
      },
      onSuccess: () => {
          toast.success("Róża usunięta")
          queryClient.invalidateQueries({ queryKey: ['admin_groups'] })
      },
      onError: (err: unknown) => {
          const error = err as { code?: string; message?: string }
          const msg = error.code === '23503' ? "Nie można usunąć (grupa ma członków)" : "Błąd usuwania"
          toast.error(msg, { description: error.message })
      }
  })

  const rotateGroupMutation = useMutation({
      mutationFn: async (id: number) => {
          const { error } = await supabase.rpc('rotate_group_members', { p_group_id: id })
          if (error) throw error
      },
      onSuccess: () => toast.success("Rotacja zakończona pomyślnie!"),
      onError: (err) => toast.error("Błąd rotacji", { description: getErrorMessage(err) })
  })


  return {
    loading: isLoading,
    actionLoading: saveGroupMutation.isPending || deleteGroupMutation.isPending || rotateGroupMutation.isPending,
    groups: groups || [],
    fetchGroups: () => queryClient.invalidateQueries({ queryKey: ['admin_groups'] }),
    saveGroup: async (name: string, id?: number) => { try { await saveGroupMutation.mutateAsync({ name, id }); return true } catch { return false } },
    deleteGroup: async (id: number) => { try { await deleteGroupMutation.mutateAsync(id); return true } catch { return false } },
    rotateGroup: async (id: number) => { try { await rotateGroupMutation.mutateAsync(id); return true } catch { return false } }
  }
}
