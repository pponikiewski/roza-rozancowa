import { supabase } from '@/shared/lib/supabase'

/**
 * Serwis obsługujący tajemnice różańca
 */
export const mysteriesService = {
  /**
   * Pobranie tajemnicy na podstawie ID
   */
  async getMysteryById(mysteryId: number) {
    const { data, error } = await supabase
      .from('mysteries')
      .select('*')
      .eq('id', mysteryId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Pobranie wszystkich tajemnic
   */
  async getAllMysteries() {
    const { data, error } = await supabase
      .from('mysteries')
      .select('id, name, part')
      .order('id')

    if (error) throw error
    return data || []
  },

  /**
   * Obliczenie ID tajemnicy dla użytkownika (RPC)
   * Wywołuje funkcję bazodanową która oblicza tajemnicę na podstawie daty i pozycji
   */
  async getMysteryIdForUser(userId: string): Promise<number | null> {
    const { data, error } = await supabase.rpc('get_mystery_id_for_user', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error calling get_mystery_id_for_user:', error)
      return null
    }

    return data
  },

  /**
   * Pobranie tajemnicy dla użytkownika (z obliczeniem ID)
   */
  async getMysteryForUser(userId: string) {
    const mysteryId = await this.getMysteryIdForUser(userId)
    if (!mysteryId) return null

    return await this.getMysteryById(mysteryId)
  },

  /**
   * Potwierdzenie zapoznania się z tajemnicą
   */
  async acknowledgeMystery(userId: string, mysteryId: number) {
    const { error } = await supabase
      .from('acknowledgments')
      .insert({ user_id: userId, mystery_id: mysteryId })

    if (error) throw error
  },

  /**
   * Sprawdzenie czy użytkownik potwierdził tajemnicę
   */
  async checkAcknowledgment(userId: string, mysteryId: number): Promise<boolean> {
    const { data } = await supabase
      .from('acknowledgments')
      .select('*')
      .eq('user_id', userId)
      .eq('mystery_id', mysteryId)
      .maybeSingle()

    return !!data
  },

  /**
   * Batch: Obliczenie ID tajemnic dla wielu użytkowników naraz (eliminuje N+1)
   * @param userIds - tablica UUID użytkowników
   * @returns Mapa user_id -> mystery_id
   */
  async getMysteryIdsForUsers(userIds: string[]): Promise<Map<string, number | null>> {
    if (userIds.length === 0) return new Map()

    const { data, error } = await supabase.rpc('get_mystery_ids_for_users', {
      p_user_ids: userIds
    })

    if (error) {
      console.error('Error calling get_mystery_ids_for_users:', error)
      return new Map()
    }

    const resultMap = new Map<string, number | null>()
    if (data) {
      for (const row of data as Array<{ user_id: string; mystery_id: number | null }>) {
        resultMap.set(row.user_id, row.mystery_id)
      }
    }
    return resultMap
  },

  /**
   * Wzbogaca listę użytkowników o dane tajemnic (current_mystery_id i opcjonalnie current_mystery_name)
   * Eliminuje duplikację kodu w membersService, rosesService i dashboardService
   * 
   * @param users - tablica obiektów z polem `id` (user_id)
   * @param options.includeName - czy dołączyć nazwę tajemnicy
   * @returns Tablica użytkowników z dodanymi polami mystery
   * 
   * @example
   * const enrichedMembers = await mysteriesService.enrichUsersWithMysteries(members)
   * // => [{ ...member, current_mystery_id: 5 }, ...]
   * 
   * const withNames = await mysteriesService.enrichUsersWithMysteries(members, { includeName: true })
   * // => [{ ...member, current_mystery_id: 5, current_mystery_name: "Zwiastowanie" }, ...]
   */
  async enrichUsersWithMysteries<T extends { id: string }>(
    users: T[],
    options: { includeName?: boolean } = {}
  ): Promise<(T & { current_mystery_id: number | null; current_mystery_name?: string })[]> {
    if (users.length === 0) return []

    const userIds = users.map(u => u.id)
    const mysteryIdsMap = await this.getMysteryIdsForUsers(userIds)

    let mysteriesMap: Map<number, string> | undefined
    if (options.includeName) {
      const mysteries = await this.getAllMysteries()
      mysteriesMap = new Map(mysteries.map(m => [m.id, m.name]))
    }

    return users.map(user => {
      const mysteryId = mysteryIdsMap.get(user.id) ?? null
      return {
        ...user,
        current_mystery_id: mysteryId,
        ...(options.includeName && {
          current_mystery_name: mysteriesMap?.get(mysteryId ?? 0) || 'Brak przydziału'
        })
      }
    })
  },
}
