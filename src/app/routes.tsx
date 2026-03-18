import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute, AdminRoute } from "@/features/auth/components/ProtectedRoute"
import { useNavigateOnAuthChange } from "@/features/auth/hooks/useNavigateOnAuthChange"
import { FeatureErrorBoundary } from "@/shared/components/layout/FeatureErrorBoundary"
import { LoadingScreen } from "@/shared/components/feedback"
import { ROUTES } from "@/shared/lib/constants"

// Eager-loaded pages (primary entry points)
import LoginPage from "@/features/auth/pages/LoginPage"
import UserPage from "@/features/user/pages/UserPage"

// Lazy-loaded admin pages
const AdminLayout = lazy(() => import("@/features/admin/layout/AdminLayout"))
const AdminMembersPage = lazy(() => import("@/features/admin/members/pages/AdminMembersPage"))
const AdminIntentionsPage = lazy(() => import("@/features/admin/intentions/pages/AdminIntentionsPage"))
const AdminRosesPage = lazy(() => import("@/features/admin/roses/pages/AdminRosesPage"))

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
        <Route path={ROUTES.DASHBOARD} element={
          <FeatureErrorBoundary featureName="Panel użytkownika">
            <UserPage />
          </FeatureErrorBoundary>
        } />
      </Route>

      {/* Protected admin routes */}
      <Route path={ROUTES.ADMIN.ROOT} element={<AdminRoute />}>
        <Route element={
          <Suspense fallback={<LoadingScreen fullScreen />}>
            <AdminLayout />
          </Suspense>
        }>
          <Route index element={<Navigate to="members" replace />} />
          <Route path="members" element={
            <FeatureErrorBoundary featureName="Użytkownicy">
              <AdminMembersPage />
            </FeatureErrorBoundary>
          } />
          <Route path="intentions" element={
            <FeatureErrorBoundary featureName="Intencje">
              <AdminIntentionsPage />
            </FeatureErrorBoundary>
          } />
          <Route path="roses" element={
            <FeatureErrorBoundary featureName="Róże">
              <AdminRosesPage />
            </FeatureErrorBoundary>
          } />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}
