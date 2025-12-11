import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Plugin do inlinowania CSS w HTML dla produkcji (eliminuje render-blocking CSS)
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
      
      // Usuwamy plik CSS z bundle, aby nie został wygenerowany jako osobny plik
      delete ctx.bundle[cssFile];
      
      // Wstawiamy zawartość CSS bezpośrednio do HTML
      return html.replace(
        '</head>', 
        `<style>${cssChunk.source}</style></head>`
      );
    }
  }
}

export default defineConfig({
  plugins: [react(), inlineCssPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020', // Nowoczesny JS = mniejszy kod
    cssCodeSplit: false, // Wymagane dla inlineCssPlugin
    reportCompressedSize: false, // Przyspiesza build
    chunkSizeWarningLimit: 1000, // Zwiększamy limit ostrzeżeń
    rollupOptions: {
      output: {
        manualChunks: {
          // Wydzielamy biblioteki do osobnych plików dla lepszego cache'owania
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