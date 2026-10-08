import { supabase } from '@/shared/lib/supabase'
import type { Session } from '@supabase/supabase-js'

/**
 * Serwis obsługujący autentykację użytkowników
 */
export const authService = {
  /**
   * Logowanie użytkownika przez login (username)
   * Konstruuje wewnętrzny email z loginu i loguje przez Supabase Auth
   */
  async signIn(login: string, password: string) {
    const email = `${login}@noemail.local`

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  /**
   * Wylogowanie użytkownika
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Subskrypcja zmian stanu autentykacji
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  },

  /**
   * Zmiana hasła użytkownika
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  },
}
