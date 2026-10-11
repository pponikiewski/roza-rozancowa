// Obsługa powiadomień push i przeładowanie starych okien po aktualizacji —
// dołączane do service workera Workbox przez importScripts (vite.config.ts)

// Okna otwarte przed aktualizacją przeładowane przez service workera.
// Wersje sprzed 7.10.2026 nie przeładowują się same (brak registerServiceWorker): po aktualizacji
// działał w nich dalej stary kod, którego baza już nie obsługuje (np. potwierdzenie tajemnicy),
// a pliki starej wersji znikały z pamięci telefonu.
// Nowsze wersje przeładowują się same przy przejęciu kontroli i dostają wtedy nowe ID okna —
// po odczekaniu przeładowywane są tylko okna z niezmienionym ID, więc nic nie przeładuje się dwa razy.
const RELOAD_STALE_DELAY_MS = 3000
// Aktualizacja, nie pierwsza instalacja — przy pierwszej nie ma starego kodu do zastąpienia
let isUpdate = false

self.addEventListener('install', () => {
  isUpdate = !!self.registration.active
})

self.addEventListener('activate', (event) => {
  if (!isUpdate) return

  event.waitUntil(
    (async () => {
      const before = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const staleIds = new Set(before.map((w) => w.id))
      if (staleIds.size === 0) return

      // navigate() działa tylko w oknach kontrolowanych przez tego service workera
      await self.clients.claim()
      await new Promise((resolve) => setTimeout(resolve, RELOAD_STALE_DELAY_MS))

      const after = await self.clients.matchAll({ type: 'window' })
      await Promise.all(
        after
          .filter((w) => staleIds.has(w.id))
          .map((w) => w.navigate(w.url).catch(() => {}))
      )
    })()
  )
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'Moja róża'

  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body,
      icon: '/notification-icon.png',
      tag: data.tag,
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      // Aplikacja już otwarta — przełącz na nią zamiast otwierać nowe okno
      const existing = windows.find((w) => w.url.startsWith(self.location.origin))
      if (existing) {
        return existing
          .focus()
          .then((w) => (w || existing).navigate(url))
          .catch(() => {})
      }
      return self.clients.openWindow(url)
    })
  )
})
