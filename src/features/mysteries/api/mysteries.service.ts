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
   * Obliczenie ID tajemnicy dla użytkownika (RPC)
   * Wywołuje funkcję bazodanową która oblicza tajemnicę na podstawie daty i pozycji
   */
  async getMysteryIdForUser(userId: string): Promise<number | null> {
    const { data, error } = await supabase.rpc('get_mystery_id_for_user', {
      p_user_id: userId
    })

    if (error) {
      return null
    }

    return data
  },

  /**
   * Potwierdzenie bieżącej tajemnicy zalogowanego użytkownika (RPC)
   * Ta sama tajemnica wraca co 20 miesięcy — ponowne potwierdzenie odświeża datę
   */
  async acknowledgeMystery(mysteryId: number) {
    const { error } = await supabase.rpc('acknowledge_mystery', { p_mystery_id: mysteryId })

    if (error) throw error
  },

  /**
   * Czy zalogowany użytkownik potwierdził tajemnicę w bieżącym okresie (RPC)
   */
  async checkAcknowledgment(mysteryId: number): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_mystery_acknowledged', { p_mystery_id: mysteryId })

    if (error) throw error
    return !!data
  },
}
