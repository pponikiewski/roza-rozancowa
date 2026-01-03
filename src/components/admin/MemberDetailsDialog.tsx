import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Circle, ScrollText, Mail, CalendarClock, RefreshCcw, Trash2, Eye, EyeOff } from "lucide-react"
import type { AdminMember } from "@/types"

interface MemberDetailsDialogProps {
  member: AdminMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateGroup: (userId: string, groupId: string) => Promise<void>
  onChangePassword: (userId: string, newPassword: string) => Promise<void>
  onDeleteUser: (userId: string, fullName: string) => void
  getMysteryName: (id: number | null) => string
  groups: Array<{ id: number; name: string }>
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
  onDeleteUser,
  getMysteryName,
  groups,
  actionLoading,
}: MemberDetailsDialogProps) {
  const [editGroupId, setEditGroupId] = useState<string>("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!member) {
      setNewPassword("")
      setShowPassword(false)
      setEditGroupId("")
    } else {
      setEditGroupId(member.groups?.id?.toString() || "unassigned")
    }
  }, [member])

  const formatFullDate = (d: string) =>
    new Date(d).toLocaleString("pl-PL", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })

  const handleUpdateGroup = async () => {
    if (!member) return
    await onUpdateGroup(member.id, editGroupId)
  }

  const handleChangePassword = async () => {
    if (!member) return
    await onChangePassword(member.id, newPassword)
    setNewPassword("")
  }

  const handleDelete = () => {
    if (!member) return
    onDeleteUser(member.id, member.full_name)
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-0">
        <div className="p-6 pb-6 bg-muted/30 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl flex flex-col gap-2 items-start">
              <span className="text-lg font-bold leading-none">{member.full_name}</span>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant={member.role === "admin" ? "default" : "secondary"} className="px-2 py-0.5 font-normal h-auto">
                  {member.role === "admin" ? "Administrator" : "Użytkownik"}
                </Badge>
                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span className="font-medium text-foreground/80">{member.groups ? member.groups.name : "Brak grupy"}</span>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">Szczegóły profilu użytkownika</DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 bg-card max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email
              </Label>
              <div
                className="font-medium text-sm truncate p-2.5 bg-muted/40 rounded-md border border-transparent hover:border-border transition-colors"
                title={member.email}
              >
                {member.email || <span className="text-muted-foreground italic">Brak</span>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5">
                <CalendarClock className="h-3 w-3" /> Dołączył(a)
              </Label>
              <div className="font-medium text-sm p-2.5 bg-muted/40 rounded-md border border-transparent hover:border-border transition-colors">
                {new Date(member.created_at).toLocaleDateString("pl-PL")}
              </div>
            </div>
          </div>

          {/* Current Mystery */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5">
              <ScrollText className="h-3 w-3" /> Aktualna Tajemnica
            </Label>
            <div className="font-medium text-sm p-3 bg-primary/5 border border-primary/10 rounded-lg text-primary">
              {getMysteryName(member.current_mystery_id)}
            </div>
          </div>

          {/* Acknowledgment Status */}
          <div
            className={`rounded-xl border p-4 transition-colors ${
              member.acknowledgments.length > 0
                ? "bg-green-50/60 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                : "bg-muted/10 border-border"
            }`}
          >
            <div className="flex items-start gap-3">
              {member.acknowledgments.length > 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Status zapoznania się z tajemnicą (Bieżący miesiąc)</h4>
                {member.acknowledgments.length > 0 ? (
                  <div className="text-sm text-muted-foreground flex flex-col">
                    <span className="text-green-700 dark:text-green-400 font-medium text-xs uppercase tracking-wide">
                      Potwierdzone
                    </span>
                    <span className="flex items-center gap-1.5 mt-1 text-xs opacity-80">
                      <CalendarClock className="h-3 w-3" />
                      {formatFullDate(member.acknowledgments[0].created_at)}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Użytkownik nie potwierdził jeszcze zapoznania się z tajemnicą w tym miesiącu.
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Management Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Zarządzanie</h3>

            {/* Change Group */}
            <div className="grid gap-2">
              <Label className="text-xs">Przypisanie do grupy</Label>
              <div className="flex gap-2">
                <Select value={editGroupId} onValueChange={setEditGroupId}>
                  <SelectTrigger className="h-9 w-full text-sm">
                    <SelectValue placeholder="-- Wybierz (lub usuń z grupy) --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">-- Bez grupy (usuń) --</SelectItem>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleUpdateGroup} disabled={actionLoading} size="sm" variant="secondary" className="shrink-0">
                  <RefreshCcw className="h-3.5 w-3.5 mr-2" /> Zmień
                </Button>
              </div>
            </div>

            {/* Change Password */}
            <div className="grid gap-2">
              <Label className="text-xs">Zmiana hasła</Label>
              <div className="flex gap-2">
                <div className="relative w-full">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Wpisz nowe hasło..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 h-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleChangePassword} disabled={actionLoading || !newPassword} size="sm" variant="outline" className="shrink-0">
                  Zapisz
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Delete Section */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-xs text-muted-foreground">
              ID: <span className="font-mono">{member.id.substring(0, 8)}...</span>
            </div>
            <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={handleDelete} disabled={actionLoading}>
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Usuń konto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
