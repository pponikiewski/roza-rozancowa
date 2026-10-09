import { z } from 'zod/mini'

/**
 * Wspólne pola walidacji używane w wielu schematach
 * Centralizuje definicje eliminując duplikację w auth.schema i member.schema
 *
 * zod/mini zamiast pełnego zoda: ta sama walidacja, ale do paczki trafiają tylko użyte sprawdzenia
 * (ok. 85 KB mniej na ekranie logowania). Każde sprawdzenie ma własny komunikat — mini nie ładuje
 * domyślnych tekstów błędów.
 */

/** Pole loginu z walidacją długości */
export const loginField = z.string().check(
  z.minLength(3, 'Login musi mieć minimum 3 znaki'),
  z.maxLength(50, 'Login jest za długi'),
)

/** Pole hasła z walidacją długości (6-100 znaków) */
export const passwordField = z.string().check(
  z.minLength(6, 'Hasło musi mieć minimum 6 znaków'),
  z.maxLength(100, 'Hasło jest za długie'),
)

/** Pole imienia i nazwiska z walidacją polskich znaków */
export const fullNameField = z.string().check(
  z.minLength(2, 'Imię i nazwisko musi mieć minimum 2 znaki'),
  z.maxLength(100, 'Imię i nazwisko jest za długie'),
  z.regex(
    /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/,
    'Imię i nazwisko może zawierać tylko litery, spacje i myślniki'
  ),
)
