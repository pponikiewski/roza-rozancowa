import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"

// Importy stron
import LoginPage from "@/pages/Login"
import UserDashboard from "@/pages/UserDashboard"

// Importy Admina
import AdminLayout from "@/layouts/AdminLayout"
import AdminMembers from "@/pages/admin/AdminMembers"
import AdminSettings from "@/pages/admin/AdminSettings"

// --- NOWE IMPORTY (ZABEZPIECZENIA) ---
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute"

// --- KOMPONENT: PŁYWAJĄCE MENU ---
function GlobalControls() {
  const location = useLocation()
  const navigate = useNavigate()

  const isLoginPage = location.pathname === "/" || location.pathname === "/login"

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <ModeToggle />
      
      {!isLoginPage && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleLogout} 
          title="Wyloguj się"
          className="bg-background/80 backdrop-blur-sm border-border shadow-sm hover:bg-destructive hover:text-white transition-colors"
        >
          <LogOut className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Wyloguj</span>
        </Button>
      )}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        
        <GlobalControls />

        <Routes>
          {/* TRASY PUBLICZNE */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          
          {/* TRASY CHRONIONE DLA UŻYTKOWNIKA (Musi być zalogowany) */}
          <Route element={<ProtectedRoute />}>
             <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          {/* TRASY CHRONIONE DLA ADMINA (Musi być zalogowany + mieć rolę 'admin') */}
          {/* AdminRoute sprawdzi rolę. Jeśli ok -> renderuje AdminLayout */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
               <Route index element={<Navigate to="members" replace />} />
               <Route path="members" element={<AdminMembers />} />
               <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* FALLBACK - Jeśli wpisze głupoty w URL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App