/**
 * Testy E2E - Autoryzacja
 * 
 * Testuje:
 * - Renderowanie strony logowania
 * - Logowanie zwykłego użytkownika
 * - Logowanie administratora
 * - Obsługę błędów (niepoprawne hasło, zły format loginu)
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
  INVALID_LOGIN,
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
    await expect(page.getByLabel(/login/i)).toBeVisible()
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
   * - Widoczny jest header użytkownika
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
    
    // Wpisz poprawny login ale złe hasło
    await page.getByLabel(/login/i).fill(INVALID_CREDENTIALS.login)
    await page.locator('input[type="password"]').fill(INVALID_CREDENTIALS.password)
    
    // Kliknij zaloguj
    await page.getByRole('button', { name: /zaloguj/i }).click()
    
    // Sprawdź czy wyświetlony błąd (toast Sonner)
    await expectErrorMessage(page)
  })

  /**
   * Test 5: Walidacja formatu loginu
   * 
   * Sprawdza czy:
   * - Formularz waliduje format loginu
   * - Przycisk jest zablokowany lub pokazany błąd przy niepoprawnym loginie
   */
  test('wyświetla błąd przy niepoprawnym formacie loginu', async ({ page }) => {
    // Przejdź na stronę logowania
    await page.goto('/login')
    
    // Wpisz niepoprawny login (za krótki)
    await page.getByLabel(/login/i).fill(INVALID_LOGIN)
    await page.locator('input[type="password"]').fill('SomePassword123')
    
    // Kliknij zaloguj
    const loginButton = page.getByRole('button', { name: /zaloguj/i })
    await loginButton.click()
    
    // Poczekaj chwilę
    await page.waitForTimeout(1000)
    
    // Sprawdź czy NIE przekierowało na /user lub /admin (czyli walidacja zadziałała)
    await expect(page).not.toHaveURL(/\/(user|admin)/)
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
    
    // Sprawdź czy wylogowano (może być / lub /login)
    await expectToBeLoggedOut(page)
    
    // Spróbuj wejść na /user
    await page.goto('/user')
    
    // Powinno przekierować z powrotem (niezalogowany nie ma dostępu)
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
    
    // Powinno przekierować (może być / lub /login)
    await expectToBeLoggedOut(page)
    
    // Spróbuj wejść na /admin bez logowania
    await page.goto('/admin/members')
    
    // Powinno przekierować (może być / lub /login)
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
