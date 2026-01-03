/**
 * Typy związane z autentykacją i profilami użytkowników
 */
export interface Group {
  id: number
  name: string
  created_at?: string
}

export interface Profile {
  id: string
  full_name: string
  rose_pos: number | null
  groups: Group | null
  role?: string
}
