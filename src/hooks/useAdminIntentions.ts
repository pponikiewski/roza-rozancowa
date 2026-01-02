import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { IntentionHistory } from "@/types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getErrorMessage } from "@/lib/utils"

export function useAdminIntentions() {
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)

  const { data: history, isLoading } = useQuery({
      queryKey: ['admin_intentions_history'],
      queryFn: async () => {
          const { data } = await supabase
            .from('intentions')
            .select('*')
            .order('year', { ascending: false })
            .order('month', { ascending: false })
          return (data as IntentionHistory[]) || []
      }
  })

  const saveIntentionMutation = useMutation({
      mutationFn: async ({ title, content }: { title: string, content: string }) => {
          if (!title.trim() || !content.trim()) throw new Error("Wypełnij wszystkie pola")
          
          const date = new Date()
          const currentMonth = date.getMonth() + 1
          const currentYear = date.getFullYear()

          const { error } = await supabase.from('intentions').upsert({ 
              month: currentMonth, 
              year: currentYear, 
              title: title, 
              content: content 
            }, { onConflict: 'month, year' })

          if (error) throw error
      },
      onSuccess: () => {
          setSaved(true)
          toast.success("Zapisano intencję")
          queryClient.invalidateQueries({ queryKey: ['admin_intentions_history'] })
          setTimeout(() => setSaved(false), 3000)
      },
      onError: (err) => toast.error("Błąd zapisu", { description: getErrorMessage(err) })
  })

  const updateIntentionMutation = useMutation({
      mutationFn: async ({ id, title, content }: { id: number, title: string, content: string }) => {
          if (!title.trim() || !content.trim()) throw new Error("Wypełnij wszystkie pola")
          
          const { error } = await supabase
            .from('intentions')
            .update({ title, content })
            .eq('id', id)

          if (error) throw error
      },
      onSuccess: () => {
          toast.success("Zaktualizowano intencję")
          queryClient.invalidateQueries({ queryKey: ['admin_intentions_history'] })
      },
      onError: (err) => toast.error("Błąd aktualizacji", { description: getErrorMessage(err) })
  })

  const deleteIntentionMutation = useMutation({
      mutationFn: async (id: number) => {
          const { error } = await supabase
            .from('intentions')
            .delete()
            .eq('id', id)

          if (error) throw error
      },
      onSuccess: () => {
          toast.success("Usunięto intencję")
          queryClient.invalidateQueries({ queryKey: ['admin_intentions_history'] })
      },
      onError: (err) => toast.error("Błąd usuwania", { description: getErrorMessage(err) })
  })


  return {
    loading: isLoading || saveIntentionMutation.isPending,
    history: history || [],
    saved,
    fetchHistory: () => queryClient.invalidateQueries({ queryKey: ['admin_intentions_history'] }),
    saveIntention: async (title: string, content: string) => { try { await saveIntentionMutation.mutateAsync({ title, content }); return true } catch { return false } },
    updateIntention: async (id: number, title: string, content: string) => { try { await updateIntentionMutation.mutateAsync({ id, title, content }); return true } catch { return false } },
    deleteIntention: async (id: number) => { try { await deleteIntentionMutation.mutateAsync(id); return true } catch { return false } }
  }
}
