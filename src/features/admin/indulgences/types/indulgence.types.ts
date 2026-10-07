/**
 * Typy dla zarządzania dniami odpustów (admin)
 */
export type { IndulgenceDay } from '@/shared/types/domain.types'

/**
 * Dane zapisywane w bazie (bez id)
 */
export interface IndulgenceInput {
  name: string
  description: string | null
  month: number | null
  day: number | null
  year: number | null
  is_easter: boolean
}
