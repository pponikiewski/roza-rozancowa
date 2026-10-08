import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Separator } from "@/shared/components/ui/separator"
import { GroupSelect } from "./GroupSelect"
import { AckStatus } from "./AckStatus"
import { PasswordInput } from "@/shared/components/common"
import type { AdminMember } from "@/features/admin/members/types/member.types"
import type { Group } from "@/shared/types/domain.types"
import { useMemberDialogState } from "@/features/admin/members/hooks/useMemberDialogState"

interface MemberDetailsDialogProps {
  member: AdminMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateGroup: (userId: string, groupId: string) => Promise<void>
  onChangePassword: (userId: string, newPassword: string) => Promise<boolean | void>
  onUpdateLogin: (userId: string, newLogin: string) => Promise<unknown>
  onDeleteUser: (userId: string, fullName: string) => void
  groups: Group[]
  groupMemberCounts: Record<number, number>
  actionLoading: boolean
}

/**
 * Dialog ze szczegółami członka i opcjami zarządzania
 * Zawiera: informacje o użytkowniku, status potwierdzenia, zmianę grupy, hasła i usuwanie
 */
export function MemberDetailsDialog({
  member,
  open,
  onOpenChange,
  onUpdateGroup,
  onChangePassword,
  onUpdateLogin,
  onDeleteUser,
  groups,
  groupMemberCounts,
  actionLoading,
}: MemberDetailsDialogProps) {
  const {
    editGroupId,
    newPassword,
    passwordError,
    editLogin,
    isEditingLogin,
    handleOpenChange,
    handleGroupChange,
    handleUpdateGroup,
    handlePasswordChange,
    handleChangePassword,
    handleDelete,
    handleLoginInputChange,
    handleSaveLogin,
    handleStartEditLogin,
    handleCancelEditLogin,
  } = useMemberDialogState({ member, onUpdateGroup, onChangePassword, onUpdateLogin, onDeleteUser, onOpenChange })

  const formatFullDate = (d: string) =>
    new Date(d).toLocaleString("pl-PL", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-lg p-0 gap-0 overflow-hidden"
        // Fokus na okno, a nie na pierwszy przycisk - inaczej "Zmień" przy loginie wygląda na zaznaczone
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).focus()
        }}
      >
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-tight">{member.full_name}</DialogTitle>
            <DialogDescription className="text-[0.9375rem]">
              {member.groups ? member.groups.name : "Brak grupy"}
              {member.role === "admin" && ", administrator"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] scrollbar-subtle">
          {/* Dane członka */}
          <dl className="divide-y">
            <div className="py-2.5">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-muted-foreground">Login</dt>
                {!isEditingLogin && (
                  <dd className="flex min-w-0 items-center gap-1">
                    <span className="truncate font-mono text-[0.9375rem]">
                      {member.login || <span className="font-sans italic text-muted-foreground">brak</span>}
                    </span>
                    <Button size="sm" variant="ghost" className="text-primary" onClick={handleStartEditLogin}>
                      Zmień
                    </Button>
                  </dd>
                )}
              </div>
              {isEditingLogin && (
                <dd className="mt-2 space-y-2">
                  <Input
                    value={editLogin}
                    onChange={(e) => handleLoginInputChange(e.target.value)}
                    aria-label="Nowy login"
                    className="font-mono"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={actionLoading || !editLogin.trim() || editLogin.trim().length < 3 || editLogin === member.login}
                      onClick={handleSaveLogin}
                    >
                      {actionLoading ? "Zapisywanie..." : "Zapisz"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEditLogin}>
                      Anuluj
                    </Button>
                  </div>
                  {editLogin.trim().length > 0 && editLogin.trim().length < 3 && (
                    <p className="text-sm text-destructive">Login musi mieć min. 3 znaki</p>
                  )}
                </dd>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted-foreground">Dołączył(a)</dt>
              <dd className="text-[0.9375rem]">{new Date(member.created_at).toLocaleDateString("pl-PL")}</dd>
            </div>

            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted-foreground">Tajemnica</dt>
              <dd className="text-right text-[0.9375rem] font-medium">{member.current_mystery_name ?? "Brak przydziału"}</dd>
            </div>

            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted-foreground">W tym miesiącu</dt>
              <dd className="text-right">
                <AckStatus acknowledged={!!member.acknowledged_at} />
                {member.acknowledged_at && (
                  <span className="block text-sm text-muted-foreground">{formatFullDate(member.acknowledged_at)}</span>
                )}
              </dd>
            </div>
          </dl>

          <Separator />

          {/* Zarządzanie */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Zarządzanie</h3>

            <div className="grid gap-2">
              <Label>Róża</Label>
              <div className="flex gap-2">
                <GroupSelect
                  value={editGroupId}
                  onValueChange={handleGroupChange}
                  groups={groups}
                  groupMemberCounts={groupMemberCounts}
                  currentGroupId={member.groups?.id}
                  placeholder="Wybierz Różę lub usuń z grupy"
                  unassignedLabel="Bez grupy (usuń z Róży)"
                  triggerClassName="w-full"
                />
                <Button onClick={handleUpdateGroup} disabled={actionLoading} variant="secondary" className="shrink-0">
                  Zmień
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Nowe hasło</Label>
              <div className="flex gap-2">
                <PasswordInput
                  aria-label="Nowe hasło"
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  hasError={!!passwordError}
                />
                <Button
                  onClick={handleChangePassword}
                  disabled={actionLoading || !newPassword.trim()}
                  variant="outline"
                  className="shrink-0"
                >
                  Zapisz
                </Button>
              </div>
              {passwordError ? (
                <p className="text-sm text-destructive">{passwordError}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Minimum 6 znaków.</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              Usuń konto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
