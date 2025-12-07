import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

// Importy stron
import LoginPage from "@/pages/Login"
import UserDashboard from "@/pages/UserDashboard"

// Importy Admina
import AdminLayout from "@/layouts/AdminLayout"
import AdminMembers from "@/pages/admin/AdminMembers"
import AdminSettings from "@/pages/admin/AdminSettings"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* Przycisk motywu na dole po prawej */}
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      
      <BrowserRouter>
        <Routes>
          {/* GŁÓWNA STRONA TO TERAZ LOGOWANIE */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Zachowujemy /login jako alias do strony głównej (dla wstecznej kompatybilności) */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          
          {/* Panel Użytkownika */}
          <Route path="/dashboard" element={<UserDashboard />} />

          {/* Panel Administratora */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="members" replace />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Wszystkie inne adresy kierują do logowania */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App