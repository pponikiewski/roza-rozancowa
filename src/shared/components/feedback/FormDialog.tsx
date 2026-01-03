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
import { Loader2 } from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface FormDialogProps {
  /** Czy dialog jest otwarty */
  open: boolean
  /** Callback zmiany stanu otwarcia */
  onOpenChange: (open: boolean) => void
  /** Tytuł dialogu */
  title: string
  /** Opis dialogu (opcjonalny) */
  description?: string
  /** Handler submit formularza */
  onSubmit: (e: React.FormEvent) => void | Promise<void>
  /** Czy trwa ładowanie */
  loading?: boolean
  /** Tekst przycisku submit */
  submitText?: string
  /** Tekst przycisku anuluj */
  cancelText?: string
  /** Zawartość formularza */
  children: ReactNode
  /** Klasa CSS dla DialogContent */
  className?: string
  /** Czy przycisk submit jest wyłączony */
  submitDisabled?: boolean
}

/**
 * Reużywalny komponent dialogu z formularzem
 * 
 * Zapewnia spójną strukturę:
 * - Dialog z headerem (tytuł + opis)
 * - Formularz z children
 * - Footer z przyciskami Anuluj/Zapisz
 * 
 * @example
 * <FormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Nowa Róża"
 *   description="Dodaj nową grupę modlitewną"
 *   onSubmit={handleSubmit}
 *   loading={loading}
 * >
 *   <div className="space-y-2">
 *     <Label>Nazwa</Label>
 *     <Input value={name} onChange={e => setName(e.target.value)} />
 *   </div>
 * </FormDialog>
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  loading = false,
  submitText = "Zapisz",
  cancelText = "Anuluj",
  children,
  className,
  submitDisabled = false,
}: FormDialogProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(e)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {children}
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button type="submit" disabled={loading || submitDisabled}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
