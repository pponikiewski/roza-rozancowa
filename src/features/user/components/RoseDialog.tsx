import { memo, useState } from "react"
import { Rose, Loader2, ScrollText, KeyRound } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { ChangePasswordDialog } from "@/features/user/components/ChangePasswordDialog"
import type { RoseMember } from "@/features/user/types/user.types"

interface RoseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName?: string
  members: RoseMember[]
  loading: boolean
  currentUserId?: string
}

/**
 * Dialog wyświetlający skład Różańcowej Róży - listę członków z ich tajemnicami
 * Zmemoizowany - rerenderuje tylko gdy zmienia się stan open, lista członków lub loading
 */
export const RoseDialog = memo(function RoseDialog({
  open,
  onOpenChange,
  groupName,
  members,
  loading,
  currentUserId,
}: RoseDialogProps) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <div className="p-6 pb-4 border-b">
            <DialogHeader className="text-left">
              <DialogTitle className="flex items-center gap-2">
                <Rose className="h-5 w-5 text-primary" />
                {groupName || "Moja Róża"}
              </DialogTitle>
              <DialogDescription>Skład Twojej róży i aktualne tajemnice.</DialogDescription>
            </DialogHeader>
          </div>

        <div className="flex-1 min-h-0 scrollbar-subtle">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm">Pobieranie danych róży...</span>
            </div>
          ) : (
            <div className="flex flex-col divide-y">
              {members.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Brak danych. Upewnij się, że jesteś przypisany do grupy.
                </div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center p-4 gap-3 transition-colors ${
                      member.id === currentUserId ? "bg-primary-soft" : "hover:bg-accent/60"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-9 w-9 min-w-[2.25rem] rounded-full bg-muted text-sm font-semibold text-foreground tabular-nums">
                      {member.rose_pos || "-"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[0.9375rem] font-semibold truncate ${
                            member.id === currentUserId ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {member.full_name}
                        </span>
                        {member.id === currentUserId && (
                          <Badge variant="default" className="px-2 py-0 text-xs">
                            Ty
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                        <ScrollText className="h-3.5 w-3.5 flex-shrink-0" />
                        {member.current_mystery_name}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

          {/* Footer z opcją zmiany hasła */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPasswordDialogOpen(true)}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <KeyRound className="h-4 w-4 mr-2" />
              Zmień hasło
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </>
  )
})
