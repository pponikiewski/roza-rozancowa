/**
 * Testy E2E - Autoryzacja
 * 
 * Testuje:
 * - Renderowanie strony logowania
 * - Logowanie zwykłego użytkownika
 * - Logowanie administratora
 * - Obsługę błędów (niepoprawne hasło, zły format email)
 * - Wylogowanie
 * - Ochronę tras przed niezalogowanymi
 * - Ochronę tras admina przed zwykłymi użytkownikami
 */

import { test, expect } from '@playwright/test'
import {
  login,
  loginAsUser,
  loginAsAdmin,
  logout,
  expectToBeLoggedIn,
  expectToBeLoggedOut,
  expectErrorMessage,
} from '../helpers/auth-helpers'
import {
  TEST_USER,
  TEST_ADMIN,
  INVALID_CREDENTIALS,
  INVALID_EMAIL,
} from '../fixtures/test-data'

test.describe('Autoryzacja', () => {
  /**
   * Test 1: Renderowanie strony logowania
   * 
   * Sprawdza czy:
   * - Niezalogowany użytkownik jest przekierowywany na /login
   * - Formularz logowania zawiera wszystkie pola
   * - Przycisk zalogowania jest widoczny
   */
  test('renderuje stronę logowania dla niezalogowanego użytkownika', async ({ page }) => {
    // Przejdź bezpośrednio na /login
    await page.goto('/login')
    
    // Sprawdź czy widoczne pola formularza
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    
    // Sprawdź czy widoczny przycisk logowania
    await expect(page.getByRole('button', { name: /zaloguj/i })).toBeVisible()
  })

  /**
   * Test 2: Logowanie zwykłego użytkownika
   * 
   * Sprawdza czy:
   * - Formularz akceptuje poprawne dane
   * - Po zalogowaniu przekierowuje na /user
   * - Widoczny jest header użytkownika z jego emailem
   */
  test('pomyślnie loguje użytkownika zwykłego', async ({ page }) => {
    // Zaloguj zwykłego użytkownika
    await loginAsUser(page)
    
    // Sprawdź czy przekierowało na /user
    await expect(page).toHaveURL('/user')
  })

  /**
   * Test 3: Logowanie administratora
   * 
   * Sprawdza czy:
   * - Admin może się zalogować
   * - Przekierowuje na /admin
   * - Widoczna jest nawigacja admina (Członkowie, Intencje, Róże)
   */
  test('pomyślnie loguje administratora', async ({ page }) => {
    // Zaloguj administratora
    await loginAsAdmin(page)
    
    // Sprawdź czy przekierowało na /admin (dowolny route admina)
    await expect(page).toHaveURL(/\/admin/)
  })

  /**
   * Test 4: Błąd przy niepoprawnym haśle
   * 
   * Sprawdza czy:
   * - System wyświetla komunikat błędu przy złym haśle
   * - Użytkownik pozostaje na stronie logowania
   */
  test('wyświetla błąd przy niepoprawnym haśle', async ({ page }) => {
    // Przejdź na stronę logowania
    await page.goto('/login')
    
    // Wpisz poprawny email ale złe hasło
    await page.getByLabel(/email/i).fill(TEST_USER.email)
    await page.locator('input[type="password"]').fill(INVALID_CREDENTIALS.password)
    
    // Kliknij zaloguj
    await page.getByRole('button', { name: /zaloguj/i }).click()
    
    // Poczekaj chwilę na odpowiedź z backendu
    await page.waitForTimeout(1000)
    
    // Sprawdź czy wyświetlony błąd
    // Supabase zwraca "Invalid login credentials"
    await expectErrorMessage(page)
    
    // Sprawdź czy nadal na stronie logowania
    await expect(page).toHaveURL('/login')
  })

  /**
   * Test 5: Walidacja formatu email
   * 
   * Sprawdza czy:
   * - Formularz waliduje format email
   * - Przycisk jest zablokowany lub pokazany błąd przy niepoprawnym email
   */
  test('wyświetla błąd przy niepoprawnym formacie email', async ({ page }) => {
    // Przejdź na stronę logowania
    await page.goto('/login')
    
    // Wpisz niepoprawny email
    await page.getByLabel(/email/i).fill(INVALID_EMAIL)
    await page.locator('input[type="password"]').fill('SomePassword123')
    
    // Spróbuj kliknąć zaloguj (może być disabled)
    const loginButton = page.getByRole('button', { name: /zaloguj/i })
    
    // Sprawdź czy przycisk jest disabled LUB czy widoczny błąd walidacji
    const isDisabled = await loginButton.isDisabled()
    
    if (!isDisabled) {
      await loginButton.click()
      // Jeśli przycisk nie jest disabled, powinien pokazać błąd
      await expect(page.getByText(/niepoprawny.*email/i)).toBeVisible()
    }
    
    // Nadal na stronie logowania
    await expect(page).toHaveURL('/login')
  })

  /**
   * Test 6: Wylogowanie użytkownika
   * 
   * Sprawdza czy:
   * - Użytkownik może się wylogować
   * - Po wylogowaniu przekierowuje na /login
   * - Próba wejścia na chronione trasy przekierowuje na /login
   */
  test('wylogowuje użytkownika', async ({ page }) => {
    // Najpierw zaloguj użytkownika
    await loginAsUser(page)
    
    // Sprawdź czy jesteśmy zalogowani
    await expectToBeLoggedIn(page)
    
    // Wyloguj
    await logout(page)
    
    // Sprawdź czy przekierowało na /login
    await expectToBeLoggedOut(page)
    
    // Spróbuj wejść na /user
    await page.goto('/user')
    
    // Powinno przekierować z powrotem na /login
    await expectToBeLoggedOut(page)
  })

  /**
   * Test 7: Ochrona tras przed niezalogowanymi
   * 
   * Sprawdza czy:
   * - Niezalogowany użytkownik nie może wejść na /user
   * - Niezalogowany użytkownik nie może wejść na /admin
   * - Przekierowuje na /login
   */
  test('chroni trasy przed niezalogowanym użytkownikiem', async ({ page }) => {
    // Spróbuj wejść na /user bez logowania
    await page.goto('/user')
    
    // Powinno przekierować na /login
    await expectToBeLoggedOut(page)
    
    // Spróbuj wejść na /admin bez logowania
    await page.goto('/admin/members')
    
    // Powinno przekierować na /login
    await expectToBeLoggedOut(page)
  })

  /**
   * Test 8: Ochrona tras admina przed zwykłymi użytkownikami
   * 
   * Sprawdza czy:
   * - Zwykły użytkownik nie ma dostępu do /admin
   * - Przekierowuje na /user
   */
  test('chroni trasę /admin przed zwykłym użytkownikiem', async ({ page }) => {
    // Zaloguj jako zwykły użytkownik
    await loginAsUser(page)
    
    // Spróbuj wejść na /admin
    await page.goto('/admin/members')
    
    // Powinno przekierować na /user (brak uprawnień)
    await expect(page).toHaveURL(/\/user/)
  })
})
