import { z } from 'zod'

/**
 * Wspólne pola walidacji używane w wielu schematach
 * Centralizuje definicje eliminując duplikację w auth.schema i member.schema
 */

/** Pole email z walidacją formatu */
export const emailField = z
  .string()
  .min(1, 'Email jest wymagany')
  .email('Nieprawidłowy format email')

/** Pole hasła z walidacją długości (6-100 znaków) */
export const passwordField = z
  .string()
  .min(6, 'Hasło musi mieć minimum 6 znaków')
  .max(100, 'Hasło jest za długie')

/** Pole imienia i nazwiska z walidacją polskich znaków */
export const fullNameField = z
  .string()
  .min(2, 'Imię i nazwisko musi mieć minimum 2 znaki')
  .max(100, 'Imię i nazwisko jest za długie')
  .regex(
    /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/,
    'Imię i nazwisko może zawierać tylko litery, spacje i myślniki'
  )
