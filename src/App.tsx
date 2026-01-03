import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute"
import { AuthProvider } from "@/context/AuthContext"
import { useNavigateOnAuthChange } from "@/hooks/useNavigateOnAuthChange"
import { ErrorBoundary } from "@/components/ErrorBoundary"

// Bezpośrednie importy - eliminuje problem "Failed to fetch dynamically imported module"
import AdminLayout from "@/layouts/AdminLayout"
import LoginPage from "@/pages/Login"
import UserDashboard from "@/pages/UserDashboard"
import AdminMembers from "@/pages/admin/AdminMembers"
import AdminIntentions from "@/pages/admin/AdminIntentions"
import AdminRoses from "@/pages/admin/AdminRoses"

/** Główny komponent aplikacji zarządzający routingiem */
function AppRoutes() {
  // Hook obsługujący redirecty na podstawie statusu autentykacji
  useNavigateOnAuthChange()

  return (
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
  )
}

/** Wrapper dla AuthProvider - potrzebny aby useNavigateOnAuthChange miał dostęp do AuthContext */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="top-center" richColors />
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App