import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Font Inter (@font-face) w index.css
import './index.css'
import { App } from '@/app'
import { registerServiceWorker } from '@/app/registerServiceWorker'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
