import { supabase } from '@/shared/lib/supabase'
import { mysteriesService } from '@/features/mysteries/api/mysteries.service'
import type { AdminMember, CreateMemberDTO } from '@/features/admin/members/types/member.types'
import type { Group } from '@/shared/types/domain.types'

interface RawMember extends Omit<AdminMember, 'current_mystery_id'> {
  acknowledgments: { created_at: string; mystery_id: number }[]
}

/**
 * Serwis obsługujący zarządzanie członkami (admin)
 */
export const membersService = {
  /**
   * Pobranie wszystkich członków wraz z grupami i potwierdzeniami
   */
  async getAllMembers(): Promise<AdminMember[]> {
    const { data: allMembers, error } = await supabase
      .from('profiles')
      .select(`
        id, full_name, email, role, rose_pos, created_at,
        groups(id, name),
        acknowledgments(created_at, mystery_id)
      `)
      .order('full_name', { ascending: true })

    if (error) throw error
    if (!allMembers) return []

    const members = await Promise.all(
      (allMembers as unknown as RawMember[]).map(async (m) => {
        const currentMysteryId = await mysteriesService.getMysteryIdForUser(m.id)
        const relevantAcks = currentMysteryId
          ? m.acknowledgments.filter((a) => Number(a.mystery_id) === Number(currentMysteryId))
          : []

        return {
          ...m,
          current_mystery_id: currentMysteryId,
          acknowledgments: relevantAcks
        } as AdminMember
      })
    )

    return members
  },

  /**
   * Pobranie wszystkich grup
   */
  async getAllGroups(): Promise<Group[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('id')

    if (error) throw error
    return data || []
  },

  /**
   * Utworzenie nowego członka
   */
  async createMember(data: CreateMemberDTO): Promise<void> {
    const { error } = await supabase.functions.invoke('create-user', {
      body: {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        groupId: data.groupId
      }
    })

    if (error) throw error
  },

  /**
   * Przeniesienie użytkownika do innej grupy
   */
  async updateMemberGroup(userId: string, groupId: number | null): Promise<void> {
    const { error } = await supabase.rpc('move_user_to_group', {
      p_user_id: userId,
      p_group_id: groupId
    })

    if (error) throw error
  },

  /**
   * Zmiana hasła członka
   */
  async changeMemberPassword(userId: string, newPassword: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('update-user-password', {
      body: { user_id: userId, new_password: newPassword }
    })

    if (error || data?.error) {
      throw new Error(error?.message || data?.error)
    }
  },

  /**
   * Usunięcie członka
   */
  async deleteMember(userId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { user_id: userId }
    })

    if (error || data?.error) {
      throw new Error(error?.message || data?.error)
    }
  },
}
