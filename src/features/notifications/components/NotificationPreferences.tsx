import { OptionGroup } from "@/shared/components/common/OptionGroup"
import { useNotificationPreferences } from "@/features/notifications/hooks/useNotificationPreferences"
import { PrayerReminderSettings } from "@/features/notifications/components/PrayerReminderSettings"
import { YES_NO_OPTIONS, type YesNo } from "@/features/notifications/components/yesNoOptions"
import type { NotificationKind } from "@/features/notifications/types/push.types"

const KINDS: { kind: NotificationKind; label: string }[] = [
  { kind: "mystery", label: "Nowa tajemnica" },
  { kind: "intention", label: "Nowa intencja" },
  { kind: "indulgence", label: "Dni odpustu" },
]

/**
 * Wybór powiadomień: tajemnica, intencja, odpust i codzienne przypomnienie o modlitwie.
 * Wyświetlany, gdy push jest włączony na tym urządzeniu; wybór dotyczy konta (wszystkich urządzeń).
 */
export function NotificationPreferences() {
  const { preferences, isLoading, setPreference } = useNotificationPreferences()

  if (isLoading) return null

  return (
    <div className="mt-4 space-y-3 border-t pt-4">
      <p className="text-sm text-muted-foreground">Wybierz, o czym chcesz dostawać powiadomienia.</p>
      {KINDS.map(({ kind, label }) => (
        <OptionGroup<YesNo>
          key={kind}
          label={label}
          value={preferences[kind] ? "yes" : "no"}
          onChange={(value) => setPreference(kind, value === "yes")}
          options={YES_NO_OPTIONS}
        />
      ))}
      <PrayerReminderSettings />
    </div>
  )
}
