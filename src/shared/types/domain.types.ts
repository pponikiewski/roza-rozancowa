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
  /** Dzień przyjęcia do Stowarzyszenia Żywego Różańca (odpust co roku) */
  admission_month?: number | null
  admission_day?: number | null
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
  login?: string
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
  meditation: string | null
  image_url: string | null
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
// ODPUSTY
// ============================================================================

/**
 * Dzień odpustu dla członków Róż
 * - is_easter → Wielkanoc, data liczona co roku (month/day/year puste)
 * - year === null → odpust co roku w danym dniu; year ustawiony → tylko w tym roku
 */
export interface IndulgenceDay {
  id: number
  name: string
  description: string | null
  month: number | null
  day: number | null
  year: number | null
  is_easter: boolean
}

// ============================================================================
// CZŁONKOWIE RÓŻY
// ============================================================================

/**
 * Członek z bieżącą tajemnicą i statusem potwierdzenia (wiersz z RPC get_members_overview)
 * acknowledged_at jest widoczne tylko dla własnego konta lub admina (RLS)
 */
export interface MemberOverview {
  id: string
  full_name: string
  login: string | null
  role: 'admin' | 'user'
  rose_pos: number | null
  created_at: string
  group_id: number | null
  group_name: string | null
  current_mystery_id: number | null
  current_mystery_name: string | null
  acknowledged_at: string | null
}

/**
 * Członek róży z przypisaną tajemnicą (widok użytkownika)
 */
export interface RoseMember {
  id: string
  full_name: string | null
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
