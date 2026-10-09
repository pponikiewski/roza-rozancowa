import { z } from 'zod/mini'

/**
 * Schema validacji dla intencji miesięcznej
 */
export const intentionSchema = z.object({
  title: z.string().check(
    z.minLength(3, 'Tytuł musi mieć minimum 3 znaki'),
    z.maxLength(200, 'Tytuł jest za długi'),
  ),
  content: z.string().check(
    z.minLength(10, 'Treść modlitwy musi mieć minimum 10 znaków'),
    z.maxLength(1000, 'Treść modlitwy jest za długa'),
  ),
})

export type IntentionFormData = z.infer<typeof intentionSchema>
