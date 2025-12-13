import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { AdminMember, Mystery } from "@/types"
import { getErrorMessage } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface RawMember extends Omit<AdminMember, 'current_mystery_id'> {
    acknowledgments: { created_at: string; mystery_id: number }[]
}

export function useAdminMembers() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
      queryKey: ['admin_members_data'],
      queryFn: async () => {
          // 1. Fetch Groups
          const { data: g } = await supabase.from('groups').select('*').order('id')
          const groups = g || []

          // 2. Fetch Mysteries
          const { data: m } = await supabase.from('mysteries').select('id, name')
          const mysteries = (m as unknown as Mystery[]) || []

          // 3. Fetch Members
          const { data: allMembers, error } = await supabase.from('profiles')
            .select(`
                id, full_name, email, role, rose_pos, created_at, 
                groups(id, name), 
                acknowledgments(created_at, mystery_id)
            `)
            .order('full_name', { ascending: true })

          if (error) throw error

          let members: AdminMember[] = []
          if (allMembers) {
             members = await Promise.all((allMembers as unknown as RawMember[]).map(async (m) => {
                const { data: calcId } = await supabase.rpc('get_mystery_id_for_user', { p_user_id: m.id })
                const currentMysteryId = calcId || null
                const relevantAcks = currentMysteryId 
                    ? m.acknowledgments.filter((a) => Number(a.mystery_id) === Number(currentMysteryId)) 
                    : []
                
                return { 
                    ...m, 
                    current_mystery_id: currentMysteryId, 
                    acknowledgments: relevantAcks 
                } as AdminMember
             }))
          }
          return { groups, mysteries, members }
      }
  })

  // Mutations
  const createMutation = useMutation({
      mutationFn: async (formData: { email: string, password: string, fullName: string, groupId: string }) => {
          const { data, error } = await supabase.functions.invoke('create-user', {
            body: { 
                ...formData, 
                groupId: formData.groupId !== "unassigned" ? parseInt(formData.groupId) : null 
            }
          })
          if (error || data?.error) throw new Error(error?.message || data?.error)
          return formData.fullName
      },
      onSuccess: (fullName) => {
          toast.success("Sukces!", { description: `Dodano użytkownika: ${fullName}` })
          queryClient.invalidateQueries({ queryKey: ['admin_members_data'] })
      },
      onError: (err) => toast.error("Błąd tworzenia", { description: getErrorMessage(err) })
  })

  const updateGroupMutation = useMutation({
      mutationFn: async ({ userId, groupId }: { userId: string, groupId: string }) => {
        const { error } = await supabase.rpc('move_user_to_group', {
            p_user_id: userId,
            p_group_id: groupId !== "unassigned" ? parseInt(groupId) : null
        })
        if (error) throw error
      },
      onSuccess: () => {
        toast.success("Zaktualizowano", { description: "Przypisanie do grupy zostało zmienione." })
        queryClient.invalidateQueries({ queryKey: ['admin_members_data'] })
      },
      onError: (err) => toast.error("Błąd aktualizacji", { description: getErrorMessage(err) })
  })

  const changePasswordMutation = useMutation({
      mutationFn: async ({ userId, newPassword }: { userId: string, newPassword: string }) => {
        if (!newPassword || newPassword.length < 6) throw new Error("Hasło za krótkie (min. 6 znaków)")
        const { data, error } = await supabase.functions.invoke('update-user-password', { 
            body: { user_id: userId, new_password: newPassword } 
        })
        if (error || data?.error) throw new Error(error?.message || data?.error)
      },
      onSuccess: () => toast.success("Hasło zmienione"),
      onError: (err) => {
           if (getErrorMessage(err).includes("Hasło za krótkie")) toast.warning(getErrorMessage(err))
           else toast.error("Błąd zmiany hasła", { description: getErrorMessage(err) })
      }
  })

  const deleteUserMutation = useMutation({
      mutationFn: async (userId: string) => {
        const { data, error } = await supabase.functions.invoke('delete-user', { body: { user_id: userId } })
        if (error || data?.error) throw new Error(error?.message || data?.error)
      },
      onSuccess: () => {
          toast.success("Użytkownik usunięty")
          queryClient.invalidateQueries({ queryKey: ['admin_members_data'] })
      },
      onError: (err) => toast.error("Błąd usuwania", { description: getErrorMessage(err) })
  })


  return {
    loading: isLoading,
    actionLoading: createMutation.isPending || updateGroupMutation.isPending || changePasswordMutation.isPending || deleteUserMutation.isPending,
    groups: data?.groups || [],
    mysteries: data?.mysteries || [],
    members: data?.members || [],
    fetchData: () => queryClient.invalidateQueries({ queryKey: ['admin_members_data'] }),
    createUser: async (v: any) => { try { await createMutation.mutateAsync(v); return true } catch { return false } },
    updateGroup: async (u: string, g: string) => { try { await updateGroupMutation.mutateAsync({ userId: u, groupId: g }); return true } catch { return false } },
    changePassword: async (u: string, p: string) => { try { await changePasswordMutation.mutateAsync({ userId: u, newPassword: p }); return true } catch { return false } },
    deleteUser: async (u: string) => { try { await deleteUserMutation.mutateAsync(u); return true } catch { return false } }
  }
}
