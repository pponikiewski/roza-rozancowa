import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card"
import { useLogout } from "@/features/auth"
import type { Profile } from "@/shared/types/domain.types"

interface NoAssignmentCardProps {
  profile: Profile | null
}

/**
 * Karta wyświetlana gdy użytkownik nie ma przypisanej tajemnicy/grupy
 */
export function NoAssignmentCard({ profile }: NoAssignmentCardProps) {
  const handleLogout = useLogout()

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 items-center justify-center text-center">
      <Card className="w-full max-w-sm border-0 bg-transparent shadow-none">
        <CardHeader className="items-center pb-2">
          <h2 className="text-xl font-semibold tracking-tight">Brak przydziału</h2>
        </CardHeader>
        <CardContent>
          <p className="text-[0.9375rem] text-muted-foreground leading-relaxed">
            Witaj, <span className="font-medium text-foreground">{profile?.full_name}</span>.<br />
            Wygląda na to, że nie należysz jeszcze do żadnej Róży lub administrator nie aktywował Twojego konta.
          </p>
        </CardContent>
        <CardFooter className="justify-center pt-2">
          <Button variant="outline" onClick={handleLogout}>
            Wyloguj się
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
