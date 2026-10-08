import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuth } from "@/features/auth/context/AuthContext"
import { DEFAULT_PREFERENCES, preferencesService } from "@/features/notifications/api/preferences.service"
import { QUERY_KEYS } from "@/shared/lib/constants"
import { getErrorMessage } from "@/shared/lib/utils"
import type { NotificationKind, NotificationPreferences } from "@/features/notifications/types/push.types"

/**
 * Hook do wyboru powiadomień zalogowanego użytkownika.
 * Zmiana widoczna od razu (optimistic update), przy błędzie wraca poprzedni stan.
 *
 * @returns preferences, isLoading, setPreference
 */
export function useNotificationPreferences() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id ?? ''
  const queryKey = QUERY_KEYS.NOTIFICATION_PREFERENCES(userId)

  const { data: preferences = DEFAULT_PREFERENCES, isLoading } = useQuery({
    queryKey,
    queryFn: () => preferencesService.get(userId),
    enabled: !!user,
  })

  const mutation = useMutation({
    mutationFn: ({ kind, enabled }: { kind: NotificationKind; enabled: boolean }) =>
      preferencesService.set(kind, enabled),
    onMutate: async ({ kind, enabled }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<NotificationPreferences>(queryKey)
      queryClient.setQueryData<NotificationPreferences>(queryKey, (old) => ({
        ...(old ?? DEFAULT_PREFERENCES),
        [kind]: enabled,
      }))
      return { previous }
    },
    onError: (err, _vars, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
      toast.error("Nie udało się zmienić ustawień powiadomień", { description: getErrorMessage(err) })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  return {
    preferences,
    isLoading,
    setPreference: (kind: NotificationKind, enabled: boolean) => mutation.mutate({ kind, enabled }),
  }
}
