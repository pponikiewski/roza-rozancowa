import { useState, useCallback, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import type { ConfirmationVariant } from "./ConfirmationDialog"

interface ConfirmationState {
  open: boolean
  title: string
  description: ReactNode
  confirmText: string
  cancelText: string
  variant: ConfirmationVariant
  icon?: LucideIcon
  onConfirm: () => void | Promise<unknown>
}

interface ConfirmOptions {
  title: string
  description: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: ConfirmationVariant
  icon?: LucideIcon
  onConfirm: () => void | Promise<unknown>
}

const initialState: ConfirmationState = {
  open: false,
  title: "",
  description: "",
  confirmText: "Potwierdź",
  cancelText: "Anuluj",
  variant: "danger",
  onConfirm: () => {},
}

/**
 * Hook do zarządzania dialogami potwierdzenia
 * 
 * @example
 * const { confirm, dialogProps } = useConfirmation()
 * 
 * // Wywołanie
 * confirm({
 *   title: "Usunąć?",
 *   description: "Czy na pewno chcesz usunąć ten element?",
 *   variant: "danger",
 *   onConfirm: async () => { await deleteItem(id) }
 * })
 * 
 * // W JSX
 * <ConfirmationDialog {...dialogProps} />
 */
export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>(initialState)
  const [loading, setLoading] = useState(false)

  const confirm = useCallback((options: ConfirmOptions) => {
    setState({
      open: true,
      title: options.title,
      description: options.description,
      confirmText: options.confirmText || "Potwierdź",
      cancelText: options.cancelText || "Anuluj",
      variant: options.variant || "danger",
      icon: options.icon,
      onConfirm: options.onConfirm,
    })
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setState(initialState)
    }
  }, [])

  const handleConfirm = useCallback(async () => {
    setLoading(true)
    try {
      await state.onConfirm()
    } finally {
      setLoading(false)
      setState(initialState)
    }
  }, [state.onConfirm])

  const dialogProps = {
    open: state.open,
    onOpenChange: handleOpenChange,
    onConfirm: handleConfirm,
    title: state.title,
    description: state.description,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    variant: state.variant,
    icon: state.icon,
    loading,
  }

  return { confirm, dialogProps }
}
