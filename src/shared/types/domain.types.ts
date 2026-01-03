/**
 * Centralne typy domenowe aplikacji
 * 
 * Ten plik zawiera podstawowe typy biznesowe używane w całej aplikacji.
 * Importuj typy stąd zamiast z poszczególnych feature'ów, aby uniknąć duplikacji.
 */

// ============================================================================
// GRUPY (RÓŻE)
// ============================================================================

/**
 * Grupa różańcowa (Róża)
 */
export interface Group {
  id: number
  name: string
  created_at?: string
}

// ============================================================================
// PROFILE UŻYTKOWNIKÓW
// ============================================================================

/**
 * Profil użytkownika
 */
export interface Profile {
  id: string
  full_name: string
  rose_pos: number | null
  groups: Group | null
  role?: 'admin' | 'user'
}

// ============================================================================
// TAJEMNICE RÓŻAŃCOWE
// ============================================================================

/**
 * Część różańca
 */
export type RosaryPart = 'Radosne' | 'Światła' | 'Bolesne' | 'Chwalebne'

/**
 * Tajemnica różańcowa
 */
export interface Mystery {
  id: number
  part: RosaryPart | string
  name: string
  meditation: string
  image_url: string
}

// ============================================================================
// INTENCJE
// ============================================================================

/**
 * Intencja modlitewna (bazowy typ)
 */
export interface Intention {
  title: string
  content: string
}

/**
 * Intencja z historii (rozszerzony typ dla admina)
 */
export interface IntentionHistory extends Intention {
  id: number
  month: number
  year: number
}

// ============================================================================
// CZŁONKOWIE RÓŻY
// ============================================================================

/**
 * Członek róży z przypisaną tajemnicą (widok użytkownika)
 */
export interface RoseMember {
  id: string
  full_name: string
  rose_pos: number | null
  current_mystery_name: string
}

/**
 * Dane użytkownika (agregat dla panelu użytkownika)
 */
export interface UserData {
  profile: Profile | null
  mystery: Mystery | null
  intention: Intention | null
  isAcknowledged: boolean
}
