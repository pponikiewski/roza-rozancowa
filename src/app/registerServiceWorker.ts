import { registerSW } from 'virtual:pwa-register'

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

/**
 * Rejestracja service workera z automatyczną aktualizacją.
 *
 * Przy registerType 'autoUpdate' nowa wersja przejmuje kontrolę, a strona przeładowuje się sama —
 * użytkownik nie musi czyścić danych ani odświeżać ręcznie.
 * Nowa wersja jest sprawdzana przy starcie, po powrocie do aplikacji (np. z ekranu głównego) i co godzinę.
 */
export function registerServiceWorker() {
  // Cache z poprzednich wersji: font (teraz w precache) i obrazy zapisane jako odpowiedzi opaque
  window.caches?.delete('fonts').catch(() => {})
  window.caches?.delete('supabase-images').catch(() => {})

  registerSW({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      if (!registration) return

      const checkForUpdate = async () => {
        if (registration.installing || !navigator.onLine) return
        try {
          // Pominięcie cache HTTP — inaczej przeglądarka mogłaby nie zauważyć nowej wersji
          const response = await fetch(swUrl, { cache: 'no-store' })
          if (response.status === 200) await registration.update()
        } catch {
          // Brak sieci / serwer niedostępny — spróbujemy przy następnej okazji
        }
      }

      setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate()
      })
    },
  })
}
