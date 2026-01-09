/**
 * Dane testowe dla testów E2E
 * 
 * UWAGA: Te dane muszą istnieć w głównej bazie!
 * Przed uruchomieniem testów E2E:
 * 1. Utwórz tych użytkowników w bazie (przez Supabase Dashboard)
 * 2. Testy używają tej samej bazy co aplikacja (z .env)
 */

/**
 * Zwykły użytkownik (member)
 * Powinien mieć przypisaną tajemnicę różańcową
 */
export const TEST_USER = {
  email: 'test.user@example.com',
  password: 'TestPassword123!',
  firstName: 'Jan',
  lastName: 'Testowy',
}

/**
 * Administrator
 * Ma dostęp do panelu /admin
 */
export const TEST_ADMIN = {
  email: 'admin@example.com',
  password: 'AdminPassword123!',
  firstName: 'Admin',
  lastName: 'Testowy',
}

/**
 * Użytkownik bez przypisania
 * Nie ma przypisanej tajemnicy - powinien widzieć NoAssignmentCard
 */
export const TEST_USER_NO_ASSIGNMENT = {
  email: 'no.assignment@example.com',
  password: 'TestPassword123!',
  firstName: 'Bez',
  lastName: 'Przypisania',
}

/**
 * Niepoprawne dane logowania (do testowania błędów)
 */
export const INVALID_CREDENTIALS = {
  email: 'wrong@example.com',
  password: 'WrongPassword123',
}

/**
 * Niepoprawny format email
 */
export const INVALID_EMAIL = 'niepoprawny-email'

/**
 * Przykładowa tajemnica różańcowa
 * (dla asercji w testach)
 */
export const EXAMPLE_MYSTERY = {
  name: 'Zwiastowanie NMP',
  part: 'Tajemnice radosne',
  meditation: 'Rozważamy jak Archanioł Gabriel zwiastował Maryi',
}

/**
 * Przykładowa intencja
 */
export const EXAMPLE_INTENTION = {
  title: 'Za pokój na świecie',
  description: 'Módlmy się o pokój i zgodę między narodami',
}
