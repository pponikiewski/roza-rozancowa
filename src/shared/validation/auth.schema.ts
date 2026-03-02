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
