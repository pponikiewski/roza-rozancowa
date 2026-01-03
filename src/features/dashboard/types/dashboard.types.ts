import type { Mystery } from '@/features/mysteries/types/mystery.types'
import type { Profile } from '@/features/auth/types/auth.types'

/**
 * Typy dla dashboardu użytkownika
 */

export interface Intention {
  title: string
  content: string
}

export interface RoseMember {
  id: string
  full_name: string
  rose_pos: number | null
  current_mystery_name: string
}

export interface DashboardData {
  profile: Profile | null
  mystery: Mystery | null
  intention: Intention | null
  isAcknowledged: boolean
}
