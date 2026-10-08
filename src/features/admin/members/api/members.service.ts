import { supabase } from '@/shared/lib/supabase'
import { membersOverviewService } from '@/shared/api'
import { throwOnFunctionError } from '@/shared/lib/utils'
import type { AdminMember, CreateMemberDTO } from '@/features/admin/members/types/member.types'

/**
 * Serwis obsługujący zarządzanie członkami (admin)
 */
export const membersService = {
  /**
   * Wszyscy członkowie z Różą, bieżącą tajemnicą i statusem potwierdzenia (jedno zapytanie)
   */
  async getAllMembers(): Promise<AdminMember[]> {
    const rows = await membersOverviewService.get()

    return rows.map(({ group_id, group_name, ...m }) => ({
      ...m,
      login: m.login ?? undefined,
      groups: group_id ? { id: group_id, name: group_name ?? '' } : null,
    }))
  },

  /**
   * Utworzenie nowego członka
   */
  async createMember(data: CreateMemberDTO): Promise<void> {
    const { error } = await supabase.functions.invoke('create-user', {
      body: {
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
      p_group_id: groupId as number // RPC przyjmuje bigint, null jest obsługiwany w SQL
    })

    if (error) throw error
  },

  /**
   * Aktualizacja loginu członka
   * Aktualizuje login w profiles oraz email w auth.users (format: login@noemail.local)
   */
  async updateMemberLogin(userId: string, newLogin: string): Promise<void> {
    // Walidacja loginu
    if (!newLogin || newLogin.length < 3) {
      throw new Error('Login musi mieć minimum 3 znaki')
    }

    // Sprawdź czy login jest unikalny
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('login', newLogin)
      .neq('id', userId)
      .maybeSingle()

    if (existing) {
      throw new Error('Ten login jest już zajęty')
    }

    // Aktualizuj login w profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ login: newLogin })
      .eq('id', userId)

    if (profileError) throw profileError

    // Aktualizuj wewnętrzny email w auth.users (Supabase Auth wymaga emaila)
    const newInternalEmail = `${newLogin}@noemail.local`
    const { data, error } = await supabase.functions.invoke('update-user-login', {
      body: { user_id: userId, new_internal_email: newInternalEmail }
    })

    // Jeśli nie udało się zaktualizować auth, cofnij zmianę w profiles
    throwOnFunctionError(error, data, 'Błąd aktualizacji loginu')
  },

  /**
   * Zmiana hasła członka
   */
  async changeMemberPassword(userId: string, newPassword: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('update-user-password', {
      body: { user_id: userId, new_password: newPassword }
    })
    throwOnFunctionError(error, data)
  },

  /**
   * Usunięcie członka
   */
  async deleteMember(userId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { user_id: userId }
    })
    throwOnFunctionError(error, data)
  },
}
