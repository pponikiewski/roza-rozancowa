import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute"
import AdminLayout from "@/layouts/AdminLayout"
import LoginPage from "@/pages/Login"
import UserDashboard from "@/pages/UserDashboard"
import AdminMembers from "@/pages/admin/AdminMembers"
import AdminIntentions from "@/pages/admin/AdminIntentions"
import AdminRoses from "@/pages/admin/AdminRoses"

/** Komponent globalnych kontrolek (zmiana motywu, wylogowanie) widoczny na każdej podstronie */
function GlobalControls() {
  const location = useLocation()
  const navigate = useNavigate()
  const isLoginPage = location.pathname === "/" || location.pathname === "/login"

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <div className="fixed top-4 right-10 z-50 flex items-center gap-2">
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

/** Główny komponent aplikacji zarządzający routingiem i globalnymi providerami */
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <GlobalControls />
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          
          <Route element={<ProtectedRoute />}>
             <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
               <Route index element={<Navigate to="members" replace />} />
               <Route path="members" element={<AdminMembers />} />
               <Route path="intentions" element={<AdminIntentions />} />
               <Route path="roses" element={<AdminRoses />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App