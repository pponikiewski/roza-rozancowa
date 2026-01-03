import { Navigate, Outlet } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/features/auth/context/AuthContext"
import { ROUTES } from "@/shared/lib/constants"

// Komponent chroniący trasy dostępne tylko dla zalogowanych użytkowników
export const ProtectedRoute = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to={ROUTES.HOME} replace />
}

// Komponent chroniący trasy administracyjne
export const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return <Navigate to={ROUTES.HOME} replace />

  // Jeśli admin -> wpuść, jeśli nie -> wyślij do dashboardu użytkownika
  return isAdmin ? <Outlet /> : <Navigate to={ROUTES.DASHBOARD} replace />
}
