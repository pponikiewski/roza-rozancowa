import { z } from 'zod'
import { passwordField, fullNameField } from './common.schema'

/**
 * Schema validacji dla tworzenia nowego użytkownika (admin)
 */
export const createUserSchema = z.object({
  password: passwordField,
  fullName: fullNameField,
  groupId: z.string(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>

/**
 * Schema validacji dla zmiany hasła użytkownika przez admina (bez potwierdzenia)
 */
export const adminChangePasswordSchema = z.object({
  newPassword: passwordField,
})

export type AdminChangePasswordFormData = z.infer<typeof adminChangePasswordSchema>
