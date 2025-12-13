import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import type { Profile, Mystery, Intention } from "@/types"

export function useDashboardData() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mystery, setMystery] = useState<Mystery | null>(null)
  const [intention, setIntention] = useState<Intention | null>(null) 
  const [isAcknowledged, setIsAcknowledged] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { 
        navigate("/login")
        return 
      }

      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, rose_pos, groups(id, name)')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.error("Error fetching profile:", profileError)
      }

      // We explicitly cast here because Supabase inference might vary, 
      // but ideally we would type the supabase client. 
      // For now, we trust the shape matches our interface.
      if (profileData) setProfile(profileData as any as Profile)

      // 2. Fetch Intention
      const date = new Date()
      const { data: intentionData } = await supabase
        .from('intentions')
        .select('title, content')
        .eq('month', date.getMonth() + 1)
        .eq('year', date.getFullYear())
        .single()
      
      if (intentionData) {
        setIntention({
          title: intentionData.title || "",
          content: intentionData.content
        })
      }

      // 3. Calculate Mystery
      let currentMysteryId: number | null = null
      const { data: calculatedId } = await supabase.rpc('get_mystery_id_for_user', { p_user_id: user.id })
      if (calculatedId) currentMysteryId = calculatedId

      if (!currentMysteryId) {
        setMystery(null)
        setLoading(false)
        return
      }

      // 4. Fetch Mystery Details
      const { data: mysteryData } = await supabase.from('mysteries').select('*').eq('id', currentMysteryId).single()
      if (mysteryData) {
         setMystery(mysteryData as Mystery)
      }

      // 5. Check Acknowledgment
      const { data: ackData } = await supabase
        .from('acknowledgments')
        .select('*')
        .eq('user_id', user.id)
        .eq('mystery_id', currentMysteryId)
        .single()
        
      setIsAcknowledged(!!ackData)
      setLoading(false)
    }

    fetchData()
  }, [navigate])

  const acknowledgeMystery = async () => {
    if (!profile || !mystery) return
    
    setActionLoading(true)
    // Artificial delay for UX
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const { error } = await supabase
        .from('acknowledgments')
        .insert({ user_id: profile.id, mystery_id: mystery.id })
    
    if (error) {
        alert("Błąd: " + error.message)
    } else {
        setIsAcknowledged(true)
    }
    setActionLoading(false)
  }

  return {
    loading,
    actionLoading,
    profile,
    mystery,
    intention,
    isAcknowledged,
    acknowledgeMystery
  }
}
