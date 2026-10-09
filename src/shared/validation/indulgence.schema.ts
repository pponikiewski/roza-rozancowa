import { z } from 'zod/mini'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * Schema validacji dla dnia odpustu
 * dateKind: 'fixed' — stała data (wymaga pola date), 'easter' — Wielkanoc liczona co roku
 */
export const indulgenceSchema = z.object({
  name: z.string().check(
    z.trim(),
    z.minLength(3, 'Nazwa musi mieć minimum 3 znaki'),
    z.maxLength(200, 'Nazwa jest za długa'),
  ),
  description: z.string().check(
    z.trim(),
    z.maxLength(1000, 'Opis jest za długi'),
  ),
  dateKind: z.enum(['fixed', 'easter']),
  date: z.string(),
  repeatYearly: z.boolean(),
}).check(
  z.refine(
    (data) => data.dateKind === 'easter' || DATE_PATTERN.test(data.date),
    { error: 'Wybierz datę', path: ['date'] }
  )
)

export type IndulgenceFormData = z.infer<typeof indulgenceSchema>
