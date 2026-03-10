import { test, expect } from '@playwright/test'
import { loginAsUser, loginAsAdmin, logout, expectToBeLoggedIn, expectToBeLoggedOut, expectErrorMessage } from '../helpers/auth-helpers'
import { INVALID_CREDENTIALS, INVALID_LOGIN } from '../fixtures/test-data'

test.describe('Autoryzacja', () => {
  test('renderuje stronę logowania dla niezalogowanego użytkownika', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/login/i)).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /zaloguj/i })).toBeVisible()
  })

  test('pomyślnie loguje użytkownika zwykłego', async ({ page }) => {
    await loginAsUser(page)
    await expect(page).toHaveURL('/user')
  })

  test('pomyślnie loguje administratora', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page).toHaveURL(/\/admin/)
  })

  test('wyświetla błąd przy niepoprawnym haśle', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/login/i).fill(INVALID_CREDENTIALS.login)
    await page.locator('input[type="password"]').fill(INVALID_CREDENTIALS.password)
    await page.getByRole('button', { name: /zaloguj/i }).click()
    await expectErrorMessage(page)
  })

  test('wyświetla błąd przy niepoprawnym formacie loginu', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/login/i).fill(INVALID_LOGIN)
    await page.locator('input[type="password"]').fill('SomePassword123')
    await page.getByRole('button', { name: /zaloguj/i }).click()
    await page.waitForTimeout(1000)
    await expect(page).not.toHaveURL(/\/(user|admin)/)
  })

  test('wylogowuje użytkownika', async ({ page }) => {
    await loginAsUser(page)
    await expectToBeLoggedIn(page)
    await logout(page)
    await expectToBeLoggedOut(page)
    await page.goto('/user')
    await expectToBeLoggedOut(page)
  })

  test('chroni trasy przed niezalogowanym użytkownikiem', async ({ page }) => {
    await page.goto('/user')
    await expectToBeLoggedOut(page)
    await page.goto('/admin/members')
    await expectToBeLoggedOut(page)
  })

  test('chroni trasę /admin przed zwykłym użytkownikiem', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/admin/members')
    await expect(page).toHaveURL(/\/user/)
  })
})

