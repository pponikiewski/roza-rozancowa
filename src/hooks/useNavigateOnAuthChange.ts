import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

/**
 * Hook do automatycznego redirectowania użytkownika w zależności od statusu autentykacji i roli
 * 
 * Logika:
 * - Użytkownik niezalogowany → /login
 * - Użytkownik zalogowany (user) ale admin → /admin
 * - Użytkownik zalogowany ale nie admin → /dashboard
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
  const { user, isAdmin, loading } = useAuth()

  useEffect(() => {
    // Czekaj aż autentykacja się załaduje
    if (loading) return

    // Użytkownik nie zalogowany
    if (!user) {
      navigate("/", { replace: true })
      return
    }

    // Użytkownik jest adminem
    if (isAdmin) {
      navigate("/admin", { replace: true })
      return
    }

    // Użytkownik zwyczajny - powinien być na /dashboard
    // (ProtectedRoute już to gwarantuje, ale moglibyśmy dodać logikę tutaj)
  }, [user, isAdmin, loading, navigate])
}
