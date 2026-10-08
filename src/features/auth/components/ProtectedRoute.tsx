import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/features/auth/context/AuthContext"
import { AppSplash } from "@/shared/components/feedback"
import { ROUTES } from "@/shared/lib/constants"

// Komponent chroniący trasy dostępne tylko dla zalogowanych użytkowników
export const ProtectedRoute = () => {
  const { user, loading } = useAuth()

  if (loading) return <AppSplash />

  return user ? <Outlet /> : <Navigate to={ROUTES.HOME} replace />
}

// Strona logowania tylko dla niezalogowanych. Zalogowany (np. start aplikacji z ekranu głównego)
// trafia od razu do swojego panelu — bez renderowania formularza i przekierowania w efekcie
export const GuestRoute = () => {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <AppSplash />

  if (user) return <Navigate to={isAdmin ? ROUTES.ADMIN.ROOT : ROUTES.DASHBOARD} replace />

  return <Outlet />
}

// Komponent chroniący trasy administracyjne
export const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <AppSplash />

  if (!user) return <Navigate to={ROUTES.HOME} replace />

  // Jeśli admin -> wpuść, jeśli nie -> wyślij do dashboardu użytkownika
  return isAdmin ? <Outlet /> : <Navigate to={ROUTES.DASHBOARD} replace />
}
