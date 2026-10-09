/**
 * Zaślepki modułów Supabase, z których aplikacja nie korzysta: Realtime (zmiany na żywo) i Storage (pliki).
 *
 * supabase-js tworzy oba klienty w konstruktorze, więc trafiały do paczki startowej (ok. 70 KB),
 * choć nic ich nie używa — obrazy tajemnic to zwykłe adresy URL, a dane pobierane są przez REST.
 * vite.config.ts podmienia na ten plik pakiety @supabase/realtime-js i @supabase/storage-js.
 *
 * Gdy aplikacja zacznie potrzebować Realtime lub Storage: usuń alias w vite.config.ts.
 */

const disabled = (feature: string) =>
  new Error(`Supabase ${feature} jest wyłączony w tej aplikacji (src/shared/lib/supabaseStubs.ts)`)

/** Wywoływany przez supabase-js tylko przy zmianie tokenu (setAuth) — pozostałe metody zgłaszają błąd */
export class RealtimeClient {
  setAuth() {
    return Promise.resolve()
  }

  channel(): never {
    throw disabled('Realtime')
  }

  getChannels() {
    return []
  }

  removeChannel(): never {
    throw disabled('Realtime')
  }

  removeAllChannels() {
    return Promise.resolve([])
  }
}

/** Tworzony w konstruktorze supabase-js, nigdy niewywoływany */
export class StorageClient {
  from(): never {
    throw disabled('Storage')
  }
}
