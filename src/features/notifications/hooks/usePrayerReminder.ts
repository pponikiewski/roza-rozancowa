import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuth } from "@/features/auth/context/AuthContext"
import { reminderService } from "@/features/notifications/api/reminder.service"
import { QUERY_KEYS } from "@/shared/lib/constants"
import { getErrorMessage } from "@/shared/lib/utils"

/**
 * Hook do codziennego przypomnienia o modlitwie zalogowanego użytkownika.
 * Zmiana widoczna od razu (optimistic update), przy błędzie wraca poprzedni stan.
 *
 * @returns time ("HH:MM" albo null = wyłączone), isLoading, saving, setTime
 */
export function usePrayerReminder() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id ?? ''
  const queryKey = QUERY_KEYS.PRAYER_REMINDER(userId)

  const { data: time = null, isLoading } = useQuery({
    queryKey,
    queryFn: () => reminderService.getTime(userId),
    enabled: !!user,
  })

  const mutation = useMutation({
    /** time = null wyłącza przypomnienie */
    mutationFn: ({ time }: { time: string | null; announce?: boolean }) =>
      time ? reminderService.setTime(time) : reminderService.disable(userId),
    onMutate: async ({ time }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<string | null>(queryKey)
      queryClient.setQueryData(queryKey, time)
      return { previous }
    },
    onSuccess: (_data, { time, announce }) => {
      if (announce && time) toast.success(`Przypomnienie ustawione na ${time}`)
    },
    onError: (err, _vars, context) => {
      queryClient.setQueryData(queryKey, context?.previous ?? null)
      toast.error("Nie udało się zmienić przypomnienia", { description: getErrorMessage(err) })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  return {
    time,
    isLoading,
    saving: mutation.isPending,
    /** announce: komunikat po zapisie (przy zmianie godziny, nie przy włączaniu) */
    setTime: (newTime: string | null, announce = false) => mutation.mutate({ time: newTime, announce }),
  }
}
