import { z } from 'zod'

/**
 * Schema validacji dla logowania użytkownika
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email jest wymagany')
    .email('Nieprawidłowy format email'),
  password: z
    .string()
    .min(6, 'Hasło musi mieć minimum 6 znaków')
    .max(100, 'Hasło jest za długie'),
})

export type LoginFormData = z.infer<typeof loginSchema>
