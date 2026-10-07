import { supabase } from '@/shared/lib/supabase'
import { getEasterDate } from '@/shared/lib/liturgical'
import type { IndulgenceDay, IndulgenceInput } from '@/features/admin/indulgences/types/indulgence.types'

/**
 * Serwis obsługujący zarządzanie dniami odpustów (admin)
 */
export const indulgencesService = {
  /**
   * Pobranie wszystkich dni odpustów w kolejności kalendarza
   * (Wielkanoc według daty w bieżącym roku)
   */
  async getIndulgences(): Promise<IndulgenceDay[]> {
    const { data, error } = await supabase
      .from('indulgence_days')
      .select('id, name, description, month, day, year, is_easter')

    if (error) throw error

    const easter = getEasterDate(new Date().getFullYear())
    const sortKey = (i: IndulgenceDay) =>
      i.is_easter ? easter.month * 100 + easter.day : (i.month ?? 0) * 100 + (i.day ?? 0)

    return (data || []).sort((a, b) => sortKey(a) - sortKey(b))
  },

  /**
   * Dodanie dnia odpustu
   */
  async createIndulgence(input: IndulgenceInput): Promise<void> {
    const { error } = await supabase.from('indulgence_days').insert(input)
    if (error) throw error
  },

  /**
   * Aktualizacja dnia odpustu
   */
  async updateIndulgence(id: number, input: IndulgenceInput): Promise<void> {
    const { error } = await supabase
      .from('indulgence_days')
      .update(input)
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Usunięcie dnia odpustu
   */
  async deleteIndulgence(id: number): Promise<void> {
    const { error } = await supabase
      .from('indulgence_days')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
