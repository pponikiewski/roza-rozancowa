import type { ReactNode } from "react"
import { AlertCircle, RotateCw, Trash2, type LucideIcon } from "lucide-react"
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
  icon?: LucideIcon
  loading?: boolean
}

const variantStyles: Record<ConfirmationVariant, {
  iconBg: string
  iconColor: string
  buttonVariant: "destructive" | "default" | "outline"
  defaultIcon: LucideIcon
}> = {
  danger: {
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-500",
    buttonVariant: "destructive",
    defaultIcon: Trash2,
  },
  warning: {
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-500",
    buttonVariant: "default",
    defaultIcon: AlertCircle,
  },
  info: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    buttonVariant: "default",
    defaultIcon: RotateCw,
  },
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
  icon,
  loading = false,
}: ConfirmationDialogProps) {
  const styles = variantStyles[variant]
  const Icon = icon || styles.defaultIcon

  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`${styles.iconBg} p-3 rounded-full shrink-0`}>
              <Icon className={`h-5 w-5 ${styles.iconColor}`} />
            </div>
            <div className="space-y-2 pt-1">
              <DialogTitle className="text-base">{title}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={styles.buttonVariant}
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
