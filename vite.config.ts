import { defineConfig } from 'vite'
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
      return html.replace('</head>', `<style>${cssChunk.source}</style></head>`);
    }
  }
}

export default defineConfig({
  plugins: [
    react(), 
    inlineCssPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'rose.svg', 'roseb.svg'],
      manifest: {
        name: 'Moja róża',
        short_name: 'Moja róża',
        description: 'Aplikacja do zarządzania Różami Różańcowymi',
        theme_color: '#1a1a1b',
        background_color: '#1a1a1b',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/roseb.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/roseb.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'sonner', 'clsx', 'tailwind-merge'],
          'vendor-supabase': ['@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    proxy: {
      '/img-proxy': {
        target: 'https://jjlxuqnwbakmiwqfycha.supabase.co/storage/v1/render/image/public',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/img-proxy/, '')
      }
    }
  }
})