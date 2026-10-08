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
   * Aktualizuje login w profiles oraz email w auth.users (format: login@noemail.local).
   * Logowanie korzysta z emaila w auth.users — gdy jego zmiana się nie uda, login w profiles
   * wraca do poprzedniego, żeby oba miejsca się nie rozjechały.
   */
  async updateMemberLogin(userId: string, newLogin: string): Promise<void> {
    const login = newLogin.trim()

    // Walidacja loginu
    if (login.length < 3) {
      throw new Error('Login musi mieć minimum 3 znaki')
    }

    // Obecny login — do przywrócenia, gdyby zmiana w auth się nie udała
    const { data: current, error: currentError } = await supabase
      .from('profiles')
      .select('login')
      .eq('id', userId)
      .single()

    if (currentError) throw currentError
    const previousLogin = current.login
    const loginChanged = previousLogin !== login

    if (loginChanged) {
      // Sprawdź czy login jest unikalny
      const { data: existing, error: existingError } = await supabase
        .from('profiles')
        .select('id')
        .eq('login', login)
        .neq('id', userId)
        .maybeSingle()

      if (existingError) throw existingError
      if (existing) {
        throw new Error('Ten login jest już zajęty')
      }

      // Aktualizuj login w profiles (RLS bez uprawnień nie zgłasza błędu, tylko nic nie zmienia)
      const { data: updated, error: profileError } = await supabase
        .from('profiles')
        .update({ login })
        .eq('id', userId)
        .select('id')

      if (profileError) throw profileError
      if (!updated?.length) throw new Error('Nie udało się zmienić loginu')
    }

    // Aktualizuj wewnętrzny email w auth.users (Supabase Auth wymaga emaila).
    // Przy tym samym loginie tylko wyrównuje auth z profilem.
    const { data, error } = await supabase.functions.invoke('update-user-login', {
      body: { user_id: userId, new_internal_email: `${login}@noemail.local` }
    })

    try {
      throwOnFunctionError(error, data, 'Błąd aktualizacji loginu')
    } catch (authError) {
      if (!loginChanged) throw authError

      // Logowanie nadal działa na stary login — przywróć go w profiles
      const { error: revertError } = await supabase
        .from('profiles')
        .update({ login: previousLogin })
        .eq('id', userId)

      if (revertError) {
        throw new Error(
          `Nie udało się zmienić loginu. Logowanie działa na stary login (${previousLogin}), ` +
          `a w profilu został nowy. Zapisz login ponownie.`
        )
      }
      throw authError
    }
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
