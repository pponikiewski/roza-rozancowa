import { z } from 'zod'
import { passwordField, fullNameField } from './common.schema'

/**
 * Schema validacji dla tworzenia nowego użytkownika (admin)
 * Email jest opcjonalny — jeśli nie podany, zostanie wygenerowany placeholder
 */
export const createUserSchema = z.object({
  email: z.string().email('Nieprawidłowy format email').or(z.literal('')).optional(),
  password: passwordField,
  fullName: fullNameField,
  groupId: z.string(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>

/**
 * Schema validacji dla zmiany hasła użytkownika
 */
export const changePasswordSchema = z.object({
  newPassword: passwordField,
})

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
