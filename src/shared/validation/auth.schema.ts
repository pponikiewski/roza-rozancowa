import { z } from 'zod/mini'
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
  .check(
    z.refine((data) => data.newPassword === data.confirmPassword, {
      error: 'Hasła muszą być identyczne',
      path: ['confirmPassword'],
    })
  )

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
