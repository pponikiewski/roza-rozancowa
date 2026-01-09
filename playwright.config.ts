/**
 * Konfiguracja Playwright dla testów E2E
 * 
 * Zawiera:
 * - baseURL: http://localhost:5173 (dev server Vite)
 * - webServer: automatyczne uruchamianie dev servera przed testami
 * - Przeglądarki: Chromium (Desktop + Mobile)
 * - Retries: 2x dla CI, 0x lokalnie
 * - Screenshots i video tylko przy błędach
 * - Ładowanie zmiennych środowiskowych z .env.local
 */

import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// ES modules - zamiennik dla __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Załaduj zmienne środowiskowe z .env.local
dotenv.config({ path: `${__dirname}/.env.local` })

export default defineConfig({
  // Folder z testami E2E
  testDir: './tests/e2e',
  
  // Global setup - tworzy użytkowników testowych automatycznie
  globalSetup: './tests/e2e/global-setup.ts',
  
  // Maksymalny czas na jeden test
  timeout: 30 * 1000,
  
  // Timeout dla każdej asercji
  expect: {
    timeout: 5000
  },
  
  // Uruchom testy równolegle
  fullyParallel: true,
  
  // Nie uruchamiaj testów jeśli są błędy w kodzie
  forbidOnly: !!process.env.CI,
  
  // Retry przy błędzie (2x na CI, 0x lokalnie)
  retries: process.env.CI ? 2 : 0,
  
  // Ilość workerów (równoległe uruchomienie)
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter (lista wyników testów)
  reporter: 'html',
  
  use: {
    // Base URL dla wszystkich testów
    baseURL: 'http://localhost:5173',
    
    // Zbieraj trace tylko przy błędzie (do debugowania)
    trace: 'on-first-retry',
    
    // Screenshot tylko przy błędzie
    screenshot: 'only-on-failure',
    
    // Video tylko przy błędzie
    video: 'retain-on-failure',
  },

  // Konfiguracja przeglądarek do testowania
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Opcjonalnie: Firefox
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // Opcjonalnie: Mobile Chrome
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Automatyczne uruchamianie dev servera przed testami
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
