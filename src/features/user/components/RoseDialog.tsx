import { memo } from "react"
import { Rose, Loader2, ScrollText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog"
import { Badge } from "@/shared/components/ui/badge"
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-4 border-b bg-muted/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rose className="h-5 w-5 text-rose-500" />
              {groupName || "Moja Róża"}
            </DialogTitle>
            <DialogDescription>Skład Twojej róży i aktualne tajemnice.</DialogDescription>
          </DialogHeader>
        </div>

        <div
          className="
            flex-1 overflow-y-auto min-h-0
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20
            [&::-webkit-scrollbar-thumb]:rounded-full
          "
        >
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
                      member.id === currentUserId ? "bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-8 w-8 min-w-[2rem] rounded-full bg-background border text-xs font-semibold text-muted-foreground shadow-sm">
                      {member.rose_pos || "-"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium truncate ${
                            member.id === currentUserId ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {member.full_name}
                        </span>
                        {member.id === currentUserId && (
                          <Badge variant="secondary" className="text-[10px] px-1 h-4">
                            Ty
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                        <ScrollText className="h-3 w-3" />
                        {member.current_mystery_name}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
})
