import { supabase } from '@/shared/lib/supabase'
import { mysteriesService } from '@/features/mysteries/api/mysteries.service'
import type { Profile, Intention, RoseMember, Mystery } from '@/shared/types/domain.types'

/**
 * Serwis obsługujący panel użytkownika
 */
export const userService = {
  /**
   * Pobranie profilu użytkownika
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, rose_pos, groups(id, name)')
      .eq('id', userId)
      .single()

    return (data as any as Profile) || null
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
   */
  async getRoseMembers(groupId: number): Promise<RoseMember[]> {
    const { data: members, error } = await supabase
      .from('profiles')
      .select('id, full_name, rose_pos')
      .eq('group_id', groupId)
      .order('rose_pos', { ascending: true })

    if (error) throw error
    if (!members) return []

    const { data: allMysteries } = await supabase
      .from('mysteries')
      .select('id, name')

    const processed = await Promise.all(
      members.map(async (m) => {
        const mysteryId = await mysteriesService.getMysteryIdForUser(m.id)
        const mysteryName = allMysteries?.find(mys => mys.id === mysteryId)?.name || "Brak przydziału"

        return {
          id: m.id,
          full_name: m.full_name,
          rose_pos: m.rose_pos,
          current_mystery_name: mysteryName
        }
      })
    )

    return processed
  },
}
