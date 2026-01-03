import { supabase } from '@/shared/lib/supabase'
import { mysteriesService } from '@/features/mysteries/api/mysteries.service'
import type { Profile, Intention, RoseMember, Mystery } from '@/shared/types/domain.types'

/**
 * Typ odpowiedzi z Supabase dla profilu z relacją groups
 */
interface ProfileResponse {
  id: string
  full_name: string
  rose_pos: number | null
  groups: { id: number; name: string } | null
}

/**
 * Serwis obsługujący panel użytkownika (dashboard)
 */
export const dashboardService = {
  /**
   * Pobranie profilu użytkownika
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, rose_pos, groups(id, name)')
      .eq('id', userId)
      .single()

    if (!data) return null
    
    // Type assertion do zdefiniowanego interfejsu zamiast any
    const profileData = data as unknown as ProfileResponse
    return profileData as Profile
  },

  /**
   * Pobranie intencji na bieżący miesiąc
   */
  async getCurrentIntention(): Promise<Intention | null> {
    const date = new Date()
    const { data } = await supabase
      .from('intentions')
      .select('title, content')
      .eq('month', date.getMonth() + 1)
      .eq('year', date.getFullYear())
      .single()

    return (data as Intention) || null
  },

  /**
   * Pobranie tajemnicy użytkownika
   */
  async getUserMystery(userId: string): Promise<Mystery | null> {
    return await mysteriesService.getMysteryForUser(userId)
  },

  /**
   * Sprawdzenie czy użytkownik potwierdził tajemnicę
   */
  async checkAcknowledgment(userId: string, mysteryId: number): Promise<boolean> {
    return await mysteriesService.checkAcknowledgment(userId, mysteryId)
  },

  /**
   * Potwierdzenie tajemnicy
   */
  async acknowledgeMystery(userId: string, mysteryId: number): Promise<void> {
    await mysteriesService.acknowledgeMystery(userId, mysteryId)
  },

  /**
   * Pobranie członków róży wraz z ich tajemnicami
   * Zoptymalizowane - używa enrichUsersWithMysteries
   */
  async getRoseMembers(groupId: number): Promise<RoseMember[]> {
    const { data: members, error } = await supabase
      .from('profiles')
      .select('id, full_name, rose_pos')
      .eq('group_id', groupId)
      .order('rose_pos', { ascending: true })

    if (error) throw error
    if (!members || members.length === 0) return []

    // Użyj wspólnej funkcji do wzbogacenia o tajemnice
    const enriched = await mysteriesService.enrichUsersWithMysteries(members, { includeName: true })

    return enriched.map(m => ({
      id: m.id,
      full_name: m.full_name,
      rose_pos: m.rose_pos,
      current_mystery_name: m.current_mystery_name!
    }))
  },
}
