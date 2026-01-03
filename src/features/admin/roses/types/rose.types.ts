/**
 * Typy dla zarządzania Różami (admin)
 * 
 * Re-eksport podstawowego typu Group z domain.types
 * oraz dodatkowe typy specyficzne dla modułu róż.
 */
export type { Group } from '@/shared/types/domain.types'

/**
 * DTO do tworzenia/aktualizacji Róży
 */
export interface SaveGroupDTO {
  name: string
  id?: number
}
