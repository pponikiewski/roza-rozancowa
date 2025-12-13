import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Group } from "@/types"
import { getErrorMessage } from "@/lib/utils"

export function useAdminRoses() {
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('groups').select('*').order('id', { ascending: true })
    if (error) toast.error("Błąd pobierania grup", { description: error.message })
    else setGroups(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const saveGroup = async (groupName: string, editingGroupId?: number) => {
    if (!groupName.trim()) return false

    setActionLoading(true)
    try {
      const query = editingGroupId 
        ? supabase.from('groups').update({ name: groupName }).eq('id', editingGroupId)
        : supabase.from('groups').insert({ name: groupName })
      
      const { error } = await query
      if (error) throw error
      
      toast.success(editingGroupId ? "Zaktualizowano nazwę Róży" : "Utworzono nową Różę")
      fetchGroups()
      return true
    } catch (error) {
      toast.error("Wystąpił błąd", { description: getErrorMessage(error) })
      return false
    } finally {
      setActionLoading(false)
    }
  }

  const deleteGroup = async (groupId: number) => {
     const { error } = await supabase.from('groups').delete().eq('id', groupId)
     if (error) {
       toast.error(error.code === '23503' ? "Nie można usunąć (grupa ma członków)" : "Błąd usuwania", { description: error.message })
       return false
     } else {
       toast.success("Róża usunięta")
       fetchGroups()
       return true
     }
  }

  const rotateGroup = async (groupId: number) => {
     const loadingToast = toast.loading("Trwa rotacja...")
     const { error } = await supabase.rpc('rotate_group_members', { p_group_id: groupId })
     toast.dismiss(loadingToast)
     if (error) {
        toast.error("Błąd rotacji", { description: error.message })
        return false
     } else {
        toast.success("Rotacja zakończona pomyślnie!")
        return true 
     }
  }

  return {
    loading,
    actionLoading,
    groups,
    fetchGroups,
    saveGroup,
    deleteGroup,
    rotateGroup
  }
}
