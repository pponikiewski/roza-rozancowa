import type { ReactNode } from "react"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

export type ConfirmationVariant = "danger" | "warning" | "info"

export interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<unknown>
  title: string
  description: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: ConfirmationVariant
  loading?: boolean
}

const buttonVariants: Record<ConfirmationVariant, "destructive" | "default"> = {
  danger: "destructive",
  warning: "default",
  info: "default",
}

/**
 * Reużywalny komponent dialogu potwierdzenia
 * 
 * Warianty:
 * - danger: dla akcji destrukcyjnych (usuwanie)
 * - warning: dla akcji wymagających uwagi
 * - info: dla akcji informacyjnych (rotacja, zmiana)
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Potwierdź",
  cancelText = "Anuluj",
  variant = "danger",
  loading = false,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription className="text-[0.9375rem] leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariants[variant]}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Przetwarzanie..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
