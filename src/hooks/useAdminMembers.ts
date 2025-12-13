import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { AdminMember, Group, Mystery } from "@/types"
import { getErrorMessage } from "@/lib/utils"

interface RawMember extends Omit<AdminMember, 'current_mystery_id'> {
    acknowledgments: { created_at: string; mystery_id: number }[]
}

export function useAdminMembers() {
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [mysteries, setMysteries] = useState<Mystery[]>([])
  const [members, setMembers] = useState<AdminMember[]>([])

  const fetchData = useCallback(async () => {
    // 1. Fetch Groups
    const { data: g } = await supabase.from('groups').select('*').order('id')
    if (g) setGroups(g)

    // 2. Fetch Mysteries
    const { data: m } = await supabase.from('mysteries').select('id, name')
    if (m) setMysteries(m as unknown as Mystery[]) // Partial select, still need casting but safer

    // 3. Fetch Members with their related data
    const { data: allMembers, error } = await supabase.from('profiles')
      .select(`
        id, full_name, email, role, rose_pos, created_at, 
        groups(id, name), 
        acknowledgments(created_at, mystery_id)
      `)
      .order('full_name', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    if (allMembers) {
      // Process members to calculate current mystery
      const processed = await Promise.all((allMembers as unknown as RawMember[]).map(async (m) => {
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
      setMembers(processed)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const createUser = async (formData: { email: string, password: string, fullName: string, groupId: string }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { 
            ...formData, 
            groupId: formData.groupId !== "unassigned" ? parseInt(formData.groupId) : null 
        }
      })
      if (error || data?.error) throw new Error(error?.message || data?.error)
      
      toast.success("Sukces!", { description: `Dodano użytkownika: ${formData.fullName}` })
      fetchData()
      return true
    } catch (err: unknown) { 
       toast.error("Błąd tworzenia", { description: getErrorMessage(err) })
       return false
    } finally { 
       setLoading(false) 
    }
  }

  const updateGroup = async (userId: string, groupId: string) => {
    setActionLoading(true)
    try {
      const { error } = await supabase.rpc('move_user_to_group', {
        p_user_id: userId,
        p_group_id: groupId !== "unassigned" ? parseInt(groupId) : null
      })
      if (error) throw error
      await fetchData()
      toast.success("Zaktualizowano", { description: "Przypisanie do grupy zostało zmienione." })
      return true
    } catch (err: unknown) { 
        toast.error("Błąd aktualizacji", { description: getErrorMessage(err) })
        return false
    } finally { 
        setActionLoading(false) 
    }
  }

  const changePassword = async (userId: string, newPassword: string) => {
     if (!newPassword || newPassword.length < 6) {
        toast.warning("Hasło za krótkie (min. 6 znaków)")
        return false
     }
     setActionLoading(true)
     try {
         const { data, error } = await supabase.functions.invoke('update-user-password', { 
            body: { user_id: userId, new_password: newPassword } 
         })
         if (error || data?.error) throw new Error(error?.message || data?.error)
         toast.success("Hasło zmienione")
         return true
     } catch (err: unknown) { 
         toast.error("Błąd zmiany hasła", { description: getErrorMessage(err) })
         return false
     } finally { 
         setActionLoading(false) 
     }
  }

  const deleteUser = async (userId: string) => {
    setActionLoading(true)
    try {
        const { data, error } = await supabase.functions.invoke('delete-user', { body: { user_id: userId } })
        if (error || data?.error) throw new Error(error?.message || data?.error)
        toast.success("Użytkownik usunięty")
        fetchData()
        return true
    } catch (err: unknown) { 
        toast.error("Błąd usuwania", { description: getErrorMessage(err) })
        return false
    } finally { 
        setActionLoading(false) 
    }
  }

  return {
    loading,
    actionLoading,
    groups,
    mysteries,
    members,
    fetchData,
    createUser,
    updateGroup,
    changePassword,
    deleteUser
  }
}
