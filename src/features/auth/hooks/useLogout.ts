import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/features/auth/context/AuthContext"
import { ROUTES } from "@/shared/lib/constants"
import { pushService } from "@/features/notifications/api/push.service"

/**
 * Hook do obsługi wylogowania użytkownika
 * Centralizuje logikę wylogowania eliminując duplikację w HeaderControls i NoAssignmentCard
 * 
 * @example
 * const logout = useLogout()
 * <Button onClick={logout}>Wyloguj</Button>
 */
export function useLogout() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  return async () => {
    try {
      // Przed signOut — usunięcie subskrypcji wymaga aktywnej sesji (RLS)
      await pushService.disableOnLogout()
      await signOut()
    } catch {
      toast.error("Błąd wylogowania")
    } finally {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }
}
