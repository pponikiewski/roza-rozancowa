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
}
