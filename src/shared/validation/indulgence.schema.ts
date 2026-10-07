import { z } from 'zod'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * Schema validacji dla dnia odpustu
 * dateKind: 'fixed' — stała data (wymaga pola date), 'easter' — Wielkanoc liczona co roku
 */
export const indulgenceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nazwa musi mieć minimum 3 znaki')
    .max(200, 'Nazwa jest za długa'),
  description: z
    .string()
    .trim()
    .max(1000, 'Opis jest za długi'),
  dateKind: z.enum(['fixed', 'easter']),
  date: z.string(),
  repeatYearly: z.boolean(),
}).refine(
  (data) => data.dateKind === 'easter' || DATE_PATTERN.test(data.date),
  { message: 'Wybierz datę', path: ['date'] }
)

export type IndulgenceFormData = z.infer<typeof indulgenceSchema>
