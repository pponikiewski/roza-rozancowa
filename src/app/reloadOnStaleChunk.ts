const RELOAD_KEY = 'chunk-reload-at'
const RELOAD_GUARD_MS = 10_000

/**
 * Przeładowanie strony, gdy nie da się wczytać leniwie ładowanego pliku (panel konta, podgląd obrazu,
 * panel admina). Zdarza się po wdrożeniu nowej wersji: otwarta aplikacja ma w pamięci stary kod,
 * a plików starej wersji nie ma już na serwerze ani w precache.
 * Po przeładowaniu aplikacja startuje z nowej wersji. Najwyżej raz na 10 s — przy braku sieci
 * błąd trafia do ErrorBoundary zamiast przeładowywać stronę w kółko.
 */
export function reloadOnStaleChunk() {
  window.addEventListener('vite:preloadError', (event) => {
    let last = 0
    try {
      last = Number(sessionStorage.getItem(RELOAD_KEY)) || 0
    } catch {
      // sessionStorage niedostępny — przeładuj bez blokady
    }
    if (Date.now() - last < RELOAD_GUARD_MS) return

    try {
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
    } catch {
      // jw.
    }
    event.preventDefault()
    window.location.reload()
  })
}
