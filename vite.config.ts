/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

const inlineCssPlugin = () => {
  return {
    name: 'inline-css',
    apply: 'build' as const,
    enforce: 'post' as const,
    transformIndexHtml(html: string, ctx: any) {
      if (!ctx.bundle) return html;
      const cssFile = Object.keys(ctx.bundle).find(key => key.endsWith('.css'));
      if (!cssFile) return html;
      const cssChunk = ctx.bundle[cssFile];
      if (!cssChunk || cssChunk.type !== 'asset') return html;
      delete ctx.bundle[cssFile];
      // Vite wstawił już <link> do tego pliku — bez usunięcia przeglądarka czekałaby na nieistniejący CSS
      // (blokuje renderowanie; Vercel odsyła wtedy index.html)
      const fileName = cssFile.split('/').pop()!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return html
        .replace(new RegExp(`<link[^>]*href="[^"]*${fileName}"[^>]*>\\s*`), '')
        .replace('</head>', `<style>${cssChunk.source}</style></head>`);
    }
  }
}

export default defineConfig({
  plugins: [
    react(), 
    inlineCssPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      // Pliki z public/ trafiają do precache przez workbox.globPatterns
      includeManifestIcons: false,
      manifest: {
        name: 'Moja róża',
        short_name: 'Moja róża',
        description: 'Aplikacja do zarządzania Różami Różańcowymi',
        lang: 'pl',
        theme_color: '#151619',
        background_color: '#151619',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // woff2: dwa pliki Inter (40 KB), potrzebne na każdym ekranie — dostępne offline od razu
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,woff2}'],
        // Ikony 512 px są potrzebne tylko przy instalacji aplikacji, nie offline
        // Obrazki startowe iOS też: system pobiera je raz, przy dodaniu do ekranu głównego
        globIgnores: ['**/icon-512.png', '**/icon-maskable-512.png', '**/splash/**'],
        // Obsługa zdarzeń push i kliknięcia w powiadomienie (public/push-sw.js)
        importScripts: ['push-sw.js'],
        runtimeCaching: [
          {
            // Obrazy tajemnic ładowane z crossOrigin="anonymous" (Storage wysyła CORS), więc w cache
            // są zwykłe odpowiedzi 200, a nie "opaque" — Chrome liczy każdą opaque jako ok. 7 MB miejsca.
            // Nowa nazwa cache: stary (supabase-images) miał odpowiedzi opaque, nieużywalne dla
            // żądań CORS — usuwa go registerServiceWorker
            urlPattern: /^https:\/\/jjlxuqnwbakmiwqfycha\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mystery-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dni
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: [
      // Wersja ESM zamiast domyślnej (wrapper na CommonJS) — dopiero w niej działają zaślepki poniżej
      { find: /^@supabase\/supabase-js$/, replacement: '@supabase/supabase-js/dist/module/index.js' },
      // Realtime i Storage nieużywane — zaślepki zamiast ok. 70 KB kodu (opis w supabaseStubs.ts)
      { find: /^@supabase\/(realtime|storage)-js$/, replacement: path.resolve(__dirname, './src/shared/lib/supabaseStubs.ts') },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "@tests", replacement: path.resolve(__dirname, "./tests") },
    ],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Biblioteki w osobnych plikach, które rzadko się zmieniają — po wdrożeniu nowej wersji
        // telefon pobiera tylko kod aplikacji. Funkcja zamiast listy pakietów, bo lista
        // obejmowała tylko wejście pakietu (np. 'react-dom' bez 'react-dom/client' i 'scheduler')
        manualChunks(id) {
          const pkg = id.match(/[\\/]node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+)/)?.[1]?.replace('\\', '/')
          if (!pkg) return
          if (['react', 'react-dom', 'scheduler', 'react-router', 'react-router-dom'].includes(pkg)) return 'vendor-react'
          if (pkg.startsWith('@tanstack/')) return 'vendor-query'
          if (pkg.startsWith('@supabase/')) return 'vendor-supabase'
          if (['lucide-react', 'sonner', 'clsx', 'tailwind-merge'].includes(pkg)) return 'vendor-ui'
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    reporters: ['verbose'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  }
})