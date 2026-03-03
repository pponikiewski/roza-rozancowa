import { z } from 'zod'
import { loginField, passwordField } from './common.schema'

/**
 * Schema validacji dla logowania użytkownika
 */
export const loginSchema = z.object({
  login: loginField,
  password: passwordField,
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Schema validacji dla zmiany hasła
 */
export const changePasswordSchema = z
  .object({
    newPassword: passwordField,
    confirmPassword: passwordField,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Hasła muszą być identyczne',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
