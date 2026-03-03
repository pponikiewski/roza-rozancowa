import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { PasswordInput } from "@/shared/components/common"
import { changePasswordSchema, type ChangePasswordFormData } from "@/shared/validation/auth.schema"
import { authService } from "@/features/auth/api/auth.service"
import { toast } from "sonner"
import { getErrorMessage } from "@/shared/lib/utils"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Dialog umożliwiający użytkownikowi zmianę hasła
 */
export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordFormData) => {
    setLoading(true)
    try {
      await authService.updatePassword(data.newPassword)
      toast.success("Hasło zostało zmienione", {
        description: "Twoje nowe hasło jest teraz aktywne.",
        duration: 5000,
      })
      reset()
      onOpenChange(false)
    } catch (err) {
      toast.error("Nie udało się zmienić hasła", {
        description: getErrorMessage(err),
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Zmiana hasła
          </DialogTitle>
          <DialogDescription>
            Wprowadź nowe hasło. Hasło musi mieć minimum 6 znaków.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nowe hasło</Label>
            <PasswordInput
              id="newPassword"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("newPassword")}
              disabled={loading}
              hasError={!!errors.newPassword}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("confirmPassword")}
              disabled={loading}
              hasError={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Zmień hasło
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
