import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute"
import { AuthProvider } from "@/context/AuthContext"
import { useNavigateOnAuthChange } from "@/hooks/useNavigateOnAuthChange"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { lazyWithRetry } from "@/lib/lazyWithRetry"
import { Suspense } from "react"

// Lazy loading stron z retry logic (obsługa "Failed to fetch" przy nowej wersji app)
const AdminLayout = lazyWithRetry(() => import("@/layouts/AdminLayout"))
const LoginPage = lazyWithRetry(() => import("@/pages/Login"))
const UserDashboard = lazyWithRetry(() => import("@/pages/UserDashboard"))
const AdminMembers = lazyWithRetry(() => import("@/pages/admin/AdminMembers"))
const AdminIntentions = lazyWithRetry(() => import("@/pages/admin/AdminIntentions"))
const AdminRoses = lazyWithRetry(() => import("@/pages/admin/AdminRoses"))

/** Główny komponent aplikacji zarządzający routingiem */
function AppRoutes() {
  // Hook obsługujący redirecty na podstawie statusu autentykacji
  useNavigateOnAuthChange()

  return (
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