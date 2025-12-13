import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { IntentionHistory } from "@/types"

export function useAdminIntentions() {
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<IntentionHistory[]>([])
  const [saved, setSaved] = useState(false)

  const fetchHistory = useCallback(async () => {
    const { data } = await supabase.from('intentions').select('*').order('year', { ascending: false }).order('month', { ascending: false })
    if (data) setHistory(data)
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const saveIntention = async (title: string, content: string) => {
    if (!title.trim() || !content.trim()) {
        toast.error("Wypełnij wszystkie pola")
        return false
    }
    
    setLoading(true)
    setSaved(false)
    const date = new Date()
    const currentMonth = date.getMonth() + 1
    const currentYear = date.getFullYear()

    const { error } = await supabase.from('intentions').upsert({ 
        month: currentMonth, 
        year: currentYear, 
        title: title,
        content: content 
      }, { onConflict: 'month, year' })

    setLoading(false)

    if (error) {
      toast.error("Błąd zapisu", { description: error.message })
      return false
    } else {
      setSaved(true)
      fetchHistory()
      toast.success("Zapisano intencję")
      setTimeout(() => setSaved(false), 3000)
      return true
    }
  }

  return {
    loading,
    history,
    saved,
    fetchHistory,
    saveIntention
  }
}
