import { supabase } from '@/shared/lib/supabase'
import type { RoseAdmission } from '@/features/admin/roses/types/rose.types'

const toAdmissionColumns = (admission: RoseAdmission) => ({
  admission_month: admission?.month ?? null,
  admission_day: admission?.day ?? null,
})

/**
 * Serwis obsługujący zarządzanie różami (admin)
 */
export const rosesService = {
  /**
   * Utworzenie nowej grupy
   */
  async createGroup(name: string, admission: RoseAdmission = null): Promise<void> {
    if (!name.trim()) throw new Error("Nazwa wymagana")

    const { error } = await supabase
      .from('groups')
      .insert({ name, ...toAdmissionColumns(admission) })

    if (error) throw error
  },

  /**
   * Aktualizacja nazwy i dnia przyjęcia grupy
   */
  async updateGroup(id: number, name: string, admission: RoseAdmission = null): Promise<void> {
    if (!name.trim()) throw new Error("Nazwa wymagana")

    const { error } = await supabase
      .from('groups')
      .update({ name, ...toAdmissionColumns(admission) })
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
}
