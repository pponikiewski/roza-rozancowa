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

/**
 * Schema validacji dla tworzenia nowego użytkownika (admin)
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email jest wymagany')
    .email('Nieprawidłowy format email'),
  password: z
    .string()
    .min(6, 'Hasło musi mieć minimum 6 znaków')
    .max(100, 'Hasło jest za długie'),
  fullName: z
    .string()
    .min(2, 'Imię i nazwisko musi mieć minimum 2 znaki')
    .max(100, 'Imię i nazwisko jest za długie')
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/, 'Imię i nazwisko może zawierać tylko litery, spacje i myślniki'),
  groupId: z.string(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>

/**
 * Schema validacji dla zmiany hasła użytkownika
 */
export const changePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, 'Hasło musi mieć minimum 6 znaków')
    .max(100, 'Hasło jest za długie'),
})

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

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
