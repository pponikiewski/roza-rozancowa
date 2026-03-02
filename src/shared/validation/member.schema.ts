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
 * Schema validacji dla zmiany hasła użytkownika
 */
export const changePasswordSchema = z.object({
  newPassword: passwordField,
})

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
