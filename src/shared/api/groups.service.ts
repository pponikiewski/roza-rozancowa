import { supabase } from '@/shared/lib/supabase'
import type { Group } from '@/shared/types/domain.types'

/**
 * Wspólny serwis do obsługi grup (róż)
 * Eliminuje duplikację getAllGroups między membersService i rosesService
 */
export const groupsService = {
  /**
   * Pobranie wszystkich grup
   */
  async getAll(): Promise<Group[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('id')

    if (error) throw error
    return data || []
  },

  /**
   * Pobranie grupy po ID
   */
  async getById(id: number): Promise<Group | null> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },
}
