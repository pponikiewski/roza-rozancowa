import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import type { Profile, Mystery, Intention } from "@/types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/context/AuthContext"

export function useDashboardData() {
  const navigate = useNavigate()
  const { user, loading: authLoading, isAdmin } = useAuth()
  const queryClient = useQueryClient()

  // Redirect if not authenticated or if Admin
  if (!authLoading && !user) {
     navigate("/login")
  }
  
  if (!authLoading && isAdmin) {
     navigate("/admin")
  }

  // 1. Fetch Profile
  const { data: profile, isLoading: profileLoading } = useQuery({
     queryKey: ['profile', user?.id],
     queryFn: async () => {
        if (!user) return null
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, rose_pos, groups(id, name)')
            .eq('id', user.id)
            .single()
        return (data as any as Profile) || null
     },
     enabled: !!user
  })

  // 2. Fetch Intention
  const { data: intention, isLoading: intentionLoading } = useQuery({
     queryKey: ['intention'],
     queryFn: async () => {
         const date = new Date()
         const { data } = await supabase
            .from('intentions')
            .select('title, content')
            .eq('month', date.getMonth() + 1)
            .eq('year', date.getFullYear())
            .single()
         return (data as Intention) || null
     }
  })

  // 3. Fetch Mystery with logic
  const { data: mystery, isLoading: mysteryLoading } = useQuery({
      queryKey: ['mystery', user?.id],
      queryFn: async () => {
          if (!user) return null
          
          let currentMysteryId: number | null = null
          const { data: calculatedId } = await supabase.rpc('get_mystery_id_for_user', { p_user_id: user.id })
          if (calculatedId) currentMysteryId = calculatedId

          if (!currentMysteryId) return null

          const { data } = await supabase.from('mysteries').select('*').eq('id', currentMysteryId).single()
          return (data as Mystery) || null
      },
      enabled: !!user
  })

  // 4. Check Acknowledgment
  const { data: isAcknowledged, isLoading: ackLoading } = useQuery({
      queryKey: ['acknowledgment', user?.id, mystery?.id],
      queryFn: async () => {
          if (!user || !mystery) return false
          const { data } = await supabase
            .from('acknowledgments')
            .select('*')
            .eq('user_id', user.id)
            .eq('mystery_id', mystery.id)
            .single()
          return !!data
      },
      enabled: !!user && !!mystery
  })

  // Mutation for acknowledgment
  const mutation = useMutation({
      mutationFn: async () => {
          if (!user || !mystery) return
          // Artificial delay
          await new Promise(resolve => setTimeout(resolve, 300))
          const { error } = await supabase
             .from('acknowledgments')
             .insert({ user_id: user.id, mystery_id: mystery.id })
          if (error) throw error
      },
      onSuccess: () => {
          // Invalidate acknowledgment query to refetch and update UI to "true"
          queryClient.invalidateQueries({ queryKey: ['acknowledgment'] })
      },
      onError: (error) => {
          alert("Błąd: " + error.message)
      }
  })

  // Consolidated loading state
  // We wait until ALL potential data sources are determined.
  // Note: We don't strictly wait for 'intention' if we want to show partial UI, 
  // but for a smooth experience it's better to wait or handle it gracefully.
  // Given the user wants NO flash, we wait for everything critical.
  const isLoading = authLoading || profileLoading || mysteryLoading || ackLoading || intentionLoading

  return {
    loading: isLoading,
    actionLoading: mutation.isPending,
    profile: profile || null,
    mystery: mystery || null,
    intention: intention || null,
    isAcknowledged: !!isAcknowledged,
    acknowledgeMystery: mutation.mutate
  }
}
