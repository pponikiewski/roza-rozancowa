import { BrowserRouter } from "react-router-dom"
import { AppProviders } from "./providers"
import { AppRoutes } from "./routes"
import { ErrorBoundary } from "@/shared/components/layout/ErrorBoundary"
import "@/App.css"

/**
 * Główny komponent aplikacji
 * 
 * Struktura:
 * 1. BrowserRouter - obsługa routingu
 * 2. ErrorBoundary - przechwytywanie błędów React
 * 3. AppProviders - wszystkie contexty (Query, Theme, Auth)
 * 4. AppRoutes - definicje tras
 */
function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
