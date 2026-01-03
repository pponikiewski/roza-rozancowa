import { QueryClient } from '@tanstack/react-query'

/**
 * Centralna konfiguracja QueryClient dla całej aplikacji
 * Definiuje domyślne zachowanie dla wszystkich queries i mutations
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Jak długo dane są uważane za "fresh" (nie będą refetchowane)
      staleTime: 1000 * 60 * 5, // 5 minut
      // Jak długo cache przechowuje dane przed usunięciem
      gcTime: 1000 * 60 * 10, // 10 minut (wcześniej cacheTime)
      // Ile razy retry query w przypadku błędu
      retry: 1,
      // Nie refetchuj kiedy użytkownik wróci do okna przeglądarki (mniej network requests)
      refetchOnWindowFocus: false,
      // Nie refetchuj kiedy component remountuje
      refetchOnMount: false,
    },
    mutations: {
      // Mutations nie powinny się retryować automatycznie
      retry: 0,
    },
  },
})
