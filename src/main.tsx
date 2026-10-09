import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Font Inter (@font-face) w index.css
import './index.css'
import { App } from '@/app'
import { registerServiceWorker } from '@/app/registerServiceWorker'
import { reloadOnStaleChunk } from '@/app/reloadOnStaleChunk'
import { queryClient } from '@/shared/lib/queryClient'
import { persistQueryCache, restoreQueryCache } from '@/shared/lib/queryPersistence'

registerServiceWorker()
reloadOnStaleChunk()
// Dane panelu z poprzedniego uruchomienia — przed renderem, więc panel ma je od pierwszej klatki
restoreQueryCache(queryClient)
persistQueryCache(queryClient)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
