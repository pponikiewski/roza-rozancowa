import { useEffect, useState } from "react"
import { toast } from "sonner"
import { pushService } from "@/features/notifications/api/push.service"
import { getErrorMessage } from "@/shared/lib/utils"
import type { PushStatus } from "@/features/notifications/types/push.types"

/**
 * Hook do zarządzania powiadomieniami push na bieżącym urządzeniu
 *
 * @returns status (null podczas sprawdzania), loading, enable, disable
 */
export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    pushService.getStatus()
      .then((s) => { if (!cancelled) setStatus(s) })
      .catch(() => { if (!cancelled) setStatus('off') })
    return () => { cancelled = true }
  }, [])

  const run = async (action: () => Promise<PushStatus>, expected: PushStatus, successMessage: string) => {
    setLoading(true)
    try {
      const next = await action()
      setStatus(next)
      if (next === expected) toast.success(successMessage)
      if (next === 'denied') toast.error("Powiadomienia zablokowane", {
        description: "Zezwól na powiadomienia w ustawieniach telefonu lub przeglądarki."
      })
    } catch (err) {
      toast.error("Nie udało się zmienić ustawień powiadomień", { description: getErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  return {
    status,
    loading,
    enable: () => run(pushService.enable, 'on', "Powiadomienia włączone"),
    disable: () => run(pushService.disable, 'off', "Powiadomienia wyłączone"),
  }
}
