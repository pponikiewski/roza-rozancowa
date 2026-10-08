// Obsługa powiadomień push — dołączana do service workera Workbox przez importScripts (vite.config.ts)

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
