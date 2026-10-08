import { supabase } from '@/shared/lib/supabase'
import type { MemberOverview } from '@/shared/types/domain.types'

/**
 * Członkowie z bieżącą tajemnicą i statusem potwierdzenia — jedno zapytanie (RPC get_members_overview)
 * Wspólne dla listy członków (admin), szczegółów Róży (admin) i składu Róży (użytkownik)
 */
export const membersOverviewService = {
  /**
   * @param groupId - skład jednej Róży (według pozycji); bez parametru wszyscy (alfabetycznie)
   */
  async get(groupId?: number): Promise<MemberOverview[]> {
    const { data, error } = await supabase.rpc('get_members_overview', groupId ? { p_group_id: groupId } : {})

    if (error) throw error
    return (data ?? []) as MemberOverview[]
  },
}
