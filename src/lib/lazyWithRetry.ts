import { lazy } from "react"
import type { ComponentType } from "react"

/**
 * Helper do lazy-loading komponentów z automatycznym retry.
 * Rozwiązuje problem "Failed to fetch dynamically imported module" 
 * który występuje gdy użytkownik ma starą wersję aplikacji w cache.
 * 
 * @param componentImport - Funkcja importująca komponent
 * @param retries - Liczba prób (domyślnie 3)
 * @param interval - Czas między próbami w ms (domyślnie 1000)
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
) {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (retriesLeft: number) => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            // Jeśli to błąd "Failed to fetch" i są jeszcze próby
            if (retriesLeft === 0) {
              // Ostatnia próba - zasugeruj reload strony
              const errorMessage = error?.message || String(error)
              if (errorMessage.includes("Failed to fetch") || errorMessage.includes("dynamically imported")) {
                // Reload strony - prawdopodobnie nowa wersja aplikacji
                console.warn("Wykryto nową wersję aplikacji. Przeładowanie strony...")
                window.location.reload()
              }
              reject(error)
            } else {
              // Próbuj ponownie po interwale
              setTimeout(() => {
                console.log(`Ponawiam import... (pozostało prób: ${retriesLeft})`)
                attemptImport(retriesLeft - 1)
              }, interval)
            }
          })
      }

      attemptImport(retries)
    })
  )
}
