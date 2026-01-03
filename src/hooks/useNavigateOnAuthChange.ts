import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

/**
 * Hook do automatycznego redirectowania użytkownika w zależności od statusu autentykacji i roli
 * 
 * Logika:
 * - Użytkownik niezalogowany na chronionej stronie → /
 * - Admin na user dashboardzie → /admin
 * - User na admin panelu → /dashboard
 * 
 * @example
 * ```typescript
 * export default function App() {
 *   useNavigateOnAuthChange()
 *   return <Routes>...</Routes>
 * }
 * ```
 */
export function useNavigateOnAuthChange() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAdmin, loading } = useAuth()

  useEffect(() => {
    // Czekaj aż autentykacja się załaduje
    if (loading) return

    const currentPath = location.pathname

    // Użytkownik nie zalogowany i próbuje wejść na chronione ścieżki
    if (!user) {
      if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/admin')) {
        navigate("/", { replace: true })
      }
      return
    }

    // Użytkownik zalogowany
    if (user) {
      // Admin próbuje wejść na user dashboard - redirect do admin
      if (isAdmin && currentPath.startsWith('/dashboard')) {
        navigate("/admin", { replace: true })
        return
      }

      // User próbuje wejść na admin panel - redirect do dashboard
      if (!isAdmin && currentPath.startsWith('/admin')) {
        navigate("/dashboard", { replace: true })
        return
      }

      // User/admin na stronie logowania - redirect do właściwej strony
      if (currentPath === '/' || currentPath === '/login') {
        if (isAdmin) {
          navigate("/admin", { replace: true })
        } else {
          navigate("/dashboard", { replace: true })
        }
      }
    }
  }, [user, isAdmin, loading, location.pathname, navigate])
}
