import { useNavigate } from "react-router-dom"
import { AlertCircle, LogOut } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card"
import { useAuth } from "@/features/auth/context/AuthContext"
import { ROUTES } from "@/shared/lib/constants"
import { toast } from "sonner"
import type { Profile } from "@/shared/types/domain.types"

interface NoAssignmentCardProps {
  profile: Profile | null
}

/**
 * Karta wyświetlana gdy użytkownik nie ma przypisanej tajemnicy/grupy
 */
export function NoAssignmentCard({ profile }: NoAssignmentCardProps) {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate(ROUTES.LOGIN)
    } catch {
      toast.error("Błąd wylogowania")
      navigate(ROUTES.LOGIN)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 p-6 items-center justify-center text-center">
      <Card className="w-full max-w-sm border-dashed border-2 shadow-none bg-transparent">
        <CardHeader className="items-center pb-2">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full mb-2">
            <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Brak przydziału</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Witaj, <span className="font-medium text-foreground">{profile?.full_name}</span>.<br />
            Wygląda na to, że nie należysz jeszcze do żadnej Róży lub administrator nie aktywował Twojego konta.
          </p>
        </CardContent>
        <CardFooter className="justify-center pt-2">
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Wyloguj się
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
