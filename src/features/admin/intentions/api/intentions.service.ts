import { supabase } from '@/shared/lib/supabase'
import type { IntentionHistory } from '@/features/admin/intentions/types/intention.types'

/**
 * Serwis obsługujący zarządzanie intencjami (admin)
 */
export const intentionsService = {
  /**
   * Pobranie historii wszystkich intencji
   */
  async getIntentionsHistory(): Promise<IntentionHistory[]> {
    const { data, error } = await supabase
      .from('intentions')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (error) throw error
    return (data as IntentionHistory[]) || []
  },

  /**
   * Pobranie intencji na bieżący miesiąc
   */
  async getCurrentIntention() {
    const date = new Date()
    const { data } = await supabase
      .from('intentions')
      .select('*')
      .eq('month', date.getMonth() + 1)
      .eq('year', date.getFullYear())
      .maybeSingle()

    return data
  },

  /**
   * Zapisanie/aktualizacja intencji na bieżący miesiąc
   */
  async saveIntention(title: string, content: string): Promise<void> {
    const date = new Date()
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    const { error } = await supabase
      .from('intentions')
      .upsert(
        { month, year, title, content },
        { onConflict: 'month,year' }
      )

    if (error) throw error
  },

  /**
   * Aktualizacja istniejącej intencji
   */
  async updateIntention(id: number, title: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('intentions')
      .update({ title, content })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Usunięcie intencji
   */
  async deleteIntention(id: number): Promise<void> {
    const { error } = await supabase
      .from('intentions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
