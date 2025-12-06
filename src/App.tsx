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

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold text-primary">Róża Różańcowa</h1>
      <a href="/login" className="text-blue-500 hover:underline">Przejdź do logowania</a>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* Przycisk motywu widoczny globalnie (można go ukryć w adminie jeśli chcesz) */}
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Panel Użytkownika */}
          <Route path="/dashboard" element={<UserDashboard />} />

          {/* Panel Administratora (Zagnieżdżony) */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* Przekierowanie z samego /admin na /admin/members */}
            <Route index element={<Navigate to="members" replace />} />
            
            <Route path="members" element={<AdminMembers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App