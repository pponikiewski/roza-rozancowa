/**
 * Typy dla zarządzania Różami (admin)
 * 
 * Re-eksport podstawowego typu Group z domain.types
 * oraz dodatkowe typy specyficzne dla modułu róż.
 */
export type { Group } from '@/shared/types/domain.types'

/**
 * Dzień przyjęcia Róży do Stowarzyszenia (co roku); null = nie ustawiono
 */
export type RoseAdmission = { month: number; day: number } | null

/**
 * DTO do tworzenia/aktualizacji Róży
 */
export interface SaveGroupDTO {
  name: string
  id?: number
}
