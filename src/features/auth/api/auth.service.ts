import { supabase } from '@/shared/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

/**
 * Serwis obsługujący autentykację użytkowników
 */
export const authService = {
  /**
   * Logowanie użytkownika przez login (username)
   * Wyszukuje email powiązany z loginem w tabeli profiles,
   * a następnie loguje przez Supabase Auth
   */
  async signIn(login: string, password: string) {
    // Wyszukaj email na podstawie loginu
    const { data: profile, error: lookupError } = await supabase
      .from('profiles')
      .select('email')
      .eq('login', login)
      .single()

    if (lookupError || !profile) {
      throw new Error('Nieprawidłowy login lub hasło')
    }

    // Użytkownicy bez emaila mają placeholder w auth.users (generowany przez create-user)
    const email = profile.email || `${login}@noemail.local`

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
   * Pobranie aktywnej sesji
   */
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  /**
   * Pobranie aktualnego użytkownika
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  /**
   * Sprawdzenie roli użytkownika
   */
  async checkUserRole(userId: string): Promise<'admin' | 'user'> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    return profile?.role === 'admin' ? 'admin' : 'user'
  },

  /**
   * Subskrypcja zmian stanu autentykacji
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  },
}
