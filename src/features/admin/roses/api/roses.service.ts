import { supabase } from '@/shared/lib/supabase'
import { mysteriesService } from '@/features/mysteries/api/mysteries.service'
import type { Group } from '@/shared/types/domain.types'

/**
 * Serwis obsługujący zarządzanie różami (admin)
 */
export const rosesService = {
  /**
   * Pobranie wszystkich grup (róż)
   */
  async getAllGroups(): Promise<Group[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Utworzenie nowej grupy
   */
  async createGroup(name: string): Promise<void> {
    if (!name.trim()) throw new Error("Nazwa wymagana")
    
    const { error } = await supabase
      .from('groups')
      .insert({ name })

    if (error) throw error
  },

  /**
   * Aktualizacja nazwy grupy
   */
  async updateGroup(id: number, name: string): Promise<void> {
    if (!name.trim()) throw new Error("Nazwa wymagana")
    
    const { error } = await supabase
      .from('groups')
      .update({ name })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Usunięcie grupy
   */
  async deleteGroup(id: number): Promise<void> {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Rotacja tajemnic w grupie
   */
  async rotateGroup(id: number): Promise<void> {
    const { error } = await supabase.rpc('rotate_group_members', { p_group_id: id })
    if (error) throw error
  },

  /**
   * Pobranie szczegółów róży (członków z ich tajemnicami)
   * Zoptymalizowane - używa batch query
   */
  async getRoseDetails(groupId: number) {
    const { data: members, error } = await supabase
      .from('profiles')
      .select('id, full_name, rose_pos, acknowledgments(created_at, mystery_id)')
      .eq('group_id', groupId)
      .order('rose_pos')

    if (error) throw error
    if (!members || members.length === 0) return []

    // Batch: pobierz wszystkie mystery_id w jednym zapytaniu
    const userIds = members.map(m => m.id)
    const mysteryIdsMap = await mysteriesService.getMysteryIdsForUsers(userIds)
    
    const mysteries = await mysteriesService.getAllMysteries()
    const mysteriesMap = new Map(mysteries.map(m => [m.id, m.name]))

    return members.map((m) => {
      const currentMysteryId = mysteryIdsMap.get(m.id) ?? null
      const mysteryName = mysteriesMap.get(currentMysteryId ?? 0) || 'Brak przydziału'
      const hasAcknowledged = currentMysteryId
        ? m.acknowledgments.some((ack) => ack.mystery_id === currentMysteryId)
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
