import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CreateUserFormData } from "@/lib/schemas"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateUserFormData) => Promise<void>
  groups: Array<{ id: number; name: string }>
  loading: boolean
}

/**
 * Dialog do tworzenia nowego użytkownika
 * Zawiera formularz z walidacją email, hasła, imienia i przypisania do grupy
 */
export function CreateUserDialog({ open, onOpenChange, onSubmit, groups, loading }: CreateUserDialogProps) {
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: "",
    password: "",
    fullName: "",
    groupId: "unassigned",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    // Reset form
    setFormData({
      email: "",
      password: "",
      fullName: "",
      groupId: "unassigned",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nowy członek</DialogTitle>
          <DialogDescription>Utwórz konto dla nowej osoby.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Imię i Nazwisko</Label>
            <Input
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hasło</Label>
              <Input
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Grupa</Label>
            <Select value={formData.groupId} onValueChange={(val) => setFormData({ ...formData, groupId: val })}>
              <SelectTrigger className="h-10 w-full text-sm">
                <SelectValue placeholder="-- Bez grupy --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">-- Bez grupy --</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id.toString()}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Tworzenie..." : "Utwórz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
