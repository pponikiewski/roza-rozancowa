import { z } from 'zod'
import { emailField, passwordField } from './common.schema'

/**
 * Schema validacji dla logowania użytkownika
 */
export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
})

export type LoginFormData = z.infer<typeof loginSchema>
