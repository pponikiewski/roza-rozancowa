import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Font Inter (@font-face) w index.css
import './index.css'
import { App } from '@/app'
import { registerServiceWorker } from '@/app/registerServiceWorker'
import { reloadOnStaleChunk } from '@/app/reloadOnStaleChunk'

registerServiceWorker()
reloadOnStaleChunk()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
