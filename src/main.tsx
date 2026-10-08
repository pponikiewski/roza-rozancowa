import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Inter z własnego serwera (zamiast Google Fonts): pobierane są tylko potrzebne zakresy znaków
import '@fontsource-variable/inter/wght.css'
import './index.css'
import { App } from '@/app'
import { registerServiceWorker } from '@/app/registerServiceWorker'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
