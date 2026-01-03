import { z } from 'zod'

/**
 * Schema validacji dla intencji miesięcznej
 */
export const intentionSchema = z.object({
  title: z
    .string()
    .min(3, 'Tytuł musi mieć minimum 3 znaki')
    .max(200, 'Tytuł jest za długi'),
  content: z
    .string()
    .min(10, 'Treść modlitwy musi mieć minimum 10 znaków')
    .max(1000, 'Treść modlitwy jest za długa'),
})

export type IntentionFormData = z.infer<typeof intentionSchema>
