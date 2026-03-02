/**
 * Helpery do testowania autoryzacji
 * 
 * Zawiera funkcje do:
 * - Logowania użytkowników
 * - Wylogowywania
 * - Sprawdzania stanu autoryzacji
 */

import { type Page, expect } from '@playwright/test'
import { TEST_USER, TEST_ADMIN } from '../fixtures/test-data'

/**
 * Loguje użytkownika poprzez formularz logowania
 * 
 * @param page - Obiekt Page z Playwright
 * @param login - Login użytkownika
 * @param password - Hasło użytkownika
 * 
 * Przykład:
 * ```ts
 * await loginWithCredentials(page, TEST_USER.login, TEST_USER.password)
 * ```
 */
export async function login(page: Page, login: string, password: string) {
  // Przejdź na stronę logowania
  await page.goto('/login')
  
  // Wypełnij formularz - używamy precyzyjnych selektorów
  await page.getByLabel(/login/i).fill(login)
  await page.locator('input[type="password"]').fill(password)
  
  // Kliknij przycisk logowania
  await page.getByRole('button', { name: /zaloguj/i }).click()
  
  // Czekaj na nawigację (przekierowanie po zalogowaniu)
  await page.waitForURL(/\/(user|admin)/)
}

/**
 * Loguje zwykłego użytkownika (TEST_USER)
 * Skrót dla login(page, TEST_USER.login, TEST_USER.password)
 */
export async function loginAsUser(page: Page) {
  await login(page, TEST_USER.login, TEST_USER.password)
}

/**
 * Loguje administratora (TEST_ADMIN)
 * Skrót dla login(page, TEST_ADMIN.login, TEST_ADMIN.password)
 */
export async function loginAsAdmin(page: Page) {
  await login(page, TEST_ADMIN.login, TEST_ADMIN.password)
}

/**
 * Wylogowuje użytkownika
 * Klika przycisk wylogowania i czeka na przekierowanie do /login
 */
export async function logout(page: Page) {
  // Znajdź i kliknij przycisk wylogowania
  // Może być w dropdown menu lub bezpośrednio widoczny
  const logoutButton = page.getByRole('button', { name: /wyloguj/i })
  
  await logoutButton.click()
  
  // Czekaj na przekierowanie do strony logowania
  await page.waitForURL('/login')
}

/**
 * Sprawdza czy użytkownik jest zalogowany
 * Weryfikuje czy jesteśmy na stronie /user lub /admin
 */
export async function expectToBeLoggedIn(page: Page) {
  await expect(page).toHaveURL(/\/(user|admin)/)
}

/**
 * Sprawdza czy użytkownik jest wylogowany
 * Weryfikuje czy jesteśmy na stronie / lub /login (niezalogowani)
 */
export async function expectToBeLoggedOut(page: Page) {
  // Sprawdź czy URL to / lub /login (z lub bez trailing slash)
  await expect(page).toHaveURL(/^http:\/\/localhost:5173\/(?:login)?\/?$/)
}

/**
 * Sprawdza czy widoczny komunikat o błędzie
 * @param page - Obiekt Page
 * @param errorMessage - Treść błędu do sprawdzenia (opcjonalne)
 */
export async function expectErrorMessage(page: Page, errorMessage?: string) {
  // Sprawdź czy widoczny toast z błędem (Sonner używa data-sonner-toast)
  const errorElement = page.locator('[data-sonner-toast][data-type="error"]')
  
  await expect(errorElement).toBeVisible({ timeout: 10000 })
  
  if (errorMessage) {
    await expect(errorElement).toContainText(errorMessage)
  }
}
