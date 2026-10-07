import { memo, useState } from "react"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { ChangePasswordDialog } from "@/features/user/components/ChangePasswordDialog"
import { AppearanceSettings } from "@/features/user/components/AppearanceSettings"
import { NotificationSettings } from "@/features/notifications/components/NotificationSettings"
import { useLogout } from "@/features/auth"
import type { RoseMember } from "@/features/user/types/user.types"

interface RoseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fullName?: string
  login?: string
  groupName?: string
  members: RoseMember[]
  loading: boolean
  currentUserId?: string
}

/**
 * Panel wysuwany od dołu po kliknięciu w swoje imię:
 * konto (zmiana hasła, wylogowanie), wygląd (motyw, wielkość tekstu), skład Róży z aktualnymi tajemnicami
 * i na końcu powiadomienia
 * Zmemoizowany - rerenderuje tylko gdy zmienia się stan open, lista członków lub loading
 */
export const RoseDialog = memo(function RoseDialog({
  open,
  onOpenChange,
  fullName,
  login,
  groupName,
  members,
  loading,
  currentUserId,
}: RoseDialogProps) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const handleLogout = useLogout()

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          // pt-12: pasek na krzyżyk zamykania, treść przewija się pod nim, a nie pod krzyżykiem
          className="mx-auto flex max-h-[90dvh] flex-col gap-0 rounded-t-xl p-0 pt-12"
          // Fokus na panel, a nie na pierwszy przycisk - inaczej "Zmień hasło" wygląda na zaznaczone
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            ;(e.currentTarget as HTMLElement).focus()
          }}
        >
          {/* Konto, wygląd i skład Róży przewijają się razem */}
          <div className="scrollbar-subtle mx-auto min-h-0 w-full max-w-lg pb-[env(safe-area-inset-bottom)]">
            {/* MOJE KONTO */}
            <section className="border-b px-5 pb-5">
              <SheetTitle className="text-xl font-semibold leading-tight">
                {fullName || "Moje konto"}
              </SheetTitle>
              <SheetDescription className={login ? "mt-1 text-sm" : "sr-only"}>
                {login ? `Login: ${login}` : "Twoje konto i skład Róży"}
              </SheetDescription>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                  Zmień hasło
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Wyloguj się
                </Button>
              </div>
            </section>

            {/* WYGLĄD */}
            <section className="border-b px-5 py-4">
              <h3 className="mb-2 text-base font-semibold">Wygląd</h3>
              <AppearanceSettings />
            </section>

            {/* SKŁAD RÓŻY */}
            <section>
              <div className="px-5 pb-2 pt-5">
                <h3 className="text-base font-semibold">{groupName || "Moja Róża"}</h3>
                <p className="text-sm text-muted-foreground">Skład Twojej Róży i aktualne tajemnice.</p>
              </div>

              <div className="px-5 pb-6">
                {loading ? (
                  <div className="divide-y" aria-busy="true">
                    <span className="sr-only">Pobieranie danych Róży...</span>
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5">
                        <Skeleton className="h-4 w-6" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-2/5" />
                          <Skeleton className="h-3.5 w-3/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nie należysz jeszcze do żadnej Róży. Skontaktuj się z administratorem.
                  </p>
                ) : (
                  <ol className="divide-y">
                    {members.map((member) => {
                      const isMe = member.id === currentUserId
                      return (
                        <li key={member.id} className="flex items-center gap-3 py-2.5">
                          <span className="w-6 flex-shrink-0 text-right text-[0.9375rem] font-semibold tabular-nums text-muted-foreground">
                            {member.rose_pos || "-"}
                          </span>
                          <div className="flex min-w-0 flex-col">
                            <span className={`truncate text-[0.9375rem] font-semibold ${isMe ? "text-primary" : "text-foreground"}`}>
                              {member.full_name}
                              {isMe && <span className="font-normal text-muted-foreground"> (Ty)</span>}
                            </span>
                            <span className="truncate text-sm text-muted-foreground">
                              {member.current_mystery_name}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </div>
            </section>

            {/* POWIADOMIENIA - na samym dole */}
            <NotificationSettings />
          </div>
        </SheetContent>
      </Sheet>
      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </>
  )
})
