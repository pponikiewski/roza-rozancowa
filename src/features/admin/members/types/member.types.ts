import type { Profile } from '@/shared/types/domain.types'

/**
 * Typy dla zarządzania członkami (admin)
 */
export interface AdminMember extends Profile {
  created_at: string
  current_mystery_id: number | null
  current_mystery_name: string | null
  /** Kiedy potwierdził(a) bieżącą tajemnicę; null = jeszcze nie */
  acknowledged_at: string | null
}

export interface CreateMemberDTO {
  password: string
  fullName: string
  groupId: number | null
}
