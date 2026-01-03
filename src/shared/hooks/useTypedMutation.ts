import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/shared/lib/utils"

interface MutationConfig<TData, TVariables> {
  /** Funkcja wykonująca operację */
  mutationFn: (variables: TVariables) => Promise<TData>
  /** Wiadomość sukcesu wyświetlana w toast */
  successMessage: string | ((data: TData) => string)
  /** Wiadomość błędu wyświetlana w toast */
  errorMessage?: string
  /** Klucze query do invalidacji po sukcesie */
  invalidateKeys?: readonly (readonly unknown[])[]
  /** Callback wywoływany po sukcesie */
  onSuccessCallback?: (data: TData) => void
  /** Callback wywoływany po błędzie */
  onErrorCallback?: (error: Error) => void
}

/**
 * Hook do tworzenia typowanych mutacji z automatyczną obsługą:
 * - Toast notifications (sukces/błąd)
 * - Invalidacji cache React Query
 * - Wrapper execute() zwracający boolean
 * 
 * @example
 * const saveMutation = useTypedMutation({
 *   mutationFn: ({ title, content }) => intentionsService.saveIntention(title, content),
 *   successMessage: "Intencja zapisana",
 *   invalidateKeys: [QUERY_KEYS.ADMIN_INTENTIONS_HISTORY]
 * })
 * 
 * // Użycie:
 * const success = await saveMutation.execute({ title, content })
 */
export function useTypedMutation<TData = void, TVariables = void>({
  mutationFn,
  successMessage,
  errorMessage = "Wystąpił błąd",
  invalidateKeys = [],
  onSuccessCallback,
  onErrorCallback,
}: MutationConfig<TData, TVariables>) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn,
    onSuccess: (data) => {
      const message = typeof successMessage === "function" 
        ? successMessage(data) 
        : successMessage
      toast.success(message)
      
      invalidateKeys.forEach(key => 
        queryClient.invalidateQueries({ queryKey: [...key] })
      )
      
      onSuccessCallback?.(data)
    },
    onError: (err: Error) => {
      toast.error(errorMessage, { description: getErrorMessage(err) })
      onErrorCallback?.(err)
    }
  })

  /**
   * Wykonuje mutację i zwraca boolean informujący o sukcesie
   */
  const execute = async (variables: TVariables): Promise<boolean> => {
    try {
      await mutation.mutateAsync(variables)
      return true
    } catch {
      return false
    }
  }

  return { 
    ...mutation, 
    execute,
    /** Alias dla isPending */
    loading: mutation.isPending 
  }
}
