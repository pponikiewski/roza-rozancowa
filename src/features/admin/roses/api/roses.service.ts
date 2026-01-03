import { supabase } from '@/shared/lib/supabase'
import { mysteriesService } from '@/features/mysteries/api/mysteries.service'

/**
 * Serwis obsługujący zarządzanie różami (admin)
 */
export const rosesService = {
  /**
   * Pobranie szczegółów róży (członków z ich tajemnicami)
   */
  async getRoseDetails(groupId: number) {
    const { data: members, error } = await supabase
      .from('profiles')
      .select('id, full_name, rose_pos, acknowledgments(created_at, mystery_id)')
      .eq('group_id', groupId)
      .order('rose_pos')

    if (error) throw error
    if (!members) return []

    const mysteries = await mysteriesService.getAllMysteries()

    const processed = await Promise.all(
      members.map(async (m: any) => {
        const currentMysteryId = await mysteriesService.getMysteryIdForUser(m.id)
        const mysteryName = mysteries.find(mys => mys.id === currentMysteryId)?.name || 'Brak przydziału'
        const hasAcknowledged = currentMysteryId
          ? m.acknowledgments.some((ack: any) => ack.mystery_id === currentMysteryId)
          : false

        return {
          id: m.id,
          full_name: m.full_name,
          rose_pos: m.rose_pos,
          current_mystery_id: currentMysteryId,
          current_mystery_name: mysteryName,
          has_acknowledged: hasAcknowledged
        }
      })
    )

    return processed
  },

  /**
   * Aktualizacja pozycji członka w róży
   */
  async updateRosePosition(userId: string, newPosition: number): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ rose_pos: newPosition })
      .eq('id', userId)

    if (error) throw error
  },
}
