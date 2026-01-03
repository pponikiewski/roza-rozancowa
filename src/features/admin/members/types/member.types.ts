import type { Profile } from '@/shared/types/domain.types'

/**
 * Typy dla zarządzania członkami (admin)
 */
export interface AdminMember extends Profile {
  email?: string
  created_at: string
  acknowledgments: { created_at: string; mystery_id: number }[]
  current_mystery_id: number | null
}

export interface CreateMemberDTO {
  email: string
  password: string
  fullName: string
  groupId: number | null
}
