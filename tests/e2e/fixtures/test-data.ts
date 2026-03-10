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
  login: 'test.user',
  password: 'TestPassword123!',
  firstName: 'Jan',
  lastName: 'Testowy',
}

/**
 * Administrator
 * Ma dostęp do panelu /admin
 */
export const TEST_ADMIN = {
  login: 'admin',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'Testowy',
}

/**
 * Użytkownik bez przypisania
 * Nie ma przypisanej tajemnicy - powinien widzieć NoAssignmentCard
 */
export const TEST_USER_NO_ASSIGNMENT = {
  login: 'no.assignment',
  password: 'admin123',
  firstName: 'Bez',
  lastName: 'Przypisania',
}

/**
 * Niepoprawne dane logowania (do testowania błędów)
 */
export const INVALID_CREDENTIALS = {
  login: 'zly.login',
  password: 'WrongPassword123',
}

/**
 * Niepoprawny login (za krótki)
 */
export const INVALID_LOGIN = 'ab'

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
