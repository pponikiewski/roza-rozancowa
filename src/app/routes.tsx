import { Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute, AdminRoute } from "@/features/auth/components/ProtectedRoute"
import { useNavigateOnAuthChange } from "@/features/auth/hooks/useNavigateOnAuthChange"
import { ROUTES } from "@/shared/lib/constants"

// Pages
import LoginPage from "@/features/auth/pages/LoginPage"
import DashboardPage from "@/features/dashboard/pages/DashboardPage"
import AdminLayout from "@/features/admin/layout/AdminLayout"
import AdminMembersPage from "@/features/admin/members/pages/AdminMembersPage"
import AdminIntentionsPage from "@/features/admin/intentions/pages/AdminIntentionsPage"
import AdminRosesPage from "@/features/admin/roses/pages/AdminRosesPage"

/**
 * Komponent definiujący wszystkie trasy aplikacji
 */
export function AppRoutes() {
  // Hook obsługujący redirecty na podstawie statusu autentykacji
  useNavigateOnAuthChange()

  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<LoginPage />} />
      <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.HOME} replace />} />

      {/* Protected user routes */}
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
      </Route>

      {/* Protected admin routes */}
      <Route path={ROUTES.ADMIN.ROOT} element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="members" replace />} />
          <Route path="members" element={<AdminMembersPage />} />
          <Route path="intentions" element={<AdminIntentionsPage />} />
          <Route path="roses" element={<AdminRosesPage />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}
