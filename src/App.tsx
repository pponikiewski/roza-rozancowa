import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute"
import { AuthProvider } from "@/context/AuthContext"
import { lazy, Suspense } from "react"

// Lazy loading stron
const AdminLayout = lazy(() => import("@/layouts/AdminLayout"))
const LoginPage = lazy(() => import("@/pages/Login"))
const UserDashboard = lazy(() => import("@/pages/UserDashboard"))
const AdminMembers = lazy(() => import("@/pages/admin/AdminMembers"))
const AdminIntentions = lazy(() => import("@/pages/admin/AdminIntentions"))
const AdminRoses = lazy(() => import("@/pages/admin/AdminRoses"))

/** Główny komponent aplikacji zarządzający routingiem i globalnymi providerami */
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" richColors />
          <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App