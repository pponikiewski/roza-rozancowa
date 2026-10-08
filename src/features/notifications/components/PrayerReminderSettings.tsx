import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { OptionGroup } from "@/shared/components/common/OptionGroup"
import { usePrayerReminder } from "@/features/notifications/hooks/usePrayerReminder"
import { YES_NO_OPTIONS, type YesNo } from "@/features/notifications/components/yesNoOptions"

const DEFAULT_TIME = "20:00"
const TIME_PATTERN = /^\d{2}:\d{2}$/

/**
 * Codzienne przypomnienie o modlitwie: włączenie i wybór godziny
 */
export function PrayerReminderSettings() {
  const { time, isLoading, saving, setTime } = usePrayerReminder()

  if (isLoading) return null

  return (
    <div>
      <OptionGroup<YesNo>
        label="Codzienne przypomnienie o modlitwie"
        value={time ? "yes" : "no"}
        onChange={(value) => setTime(value === "yes" ? DEFAULT_TIME : null)}
        options={YES_NO_OPTIONS}
      />
      {/* key: po zapisie pole godziny startuje od wartości z bazy */}
      {time && <ReminderTime key={time} time={time} saving={saving} onSave={(t) => setTime(t, true)} />}
    </div>
  )
}

interface ReminderTimeProps {
  time: string
  saving: boolean
  onSave: (time: string) => void
}

function ReminderTime({ time, saving, onSave }: ReminderTimeProps) {
  const [draft, setDraft] = useState(time)
  const isChanged = draft !== time && TIME_PATTERN.test(draft)

  return (
    <div className="mt-2 flex items-center gap-3">
      <Label htmlFor="prayer-reminder-time" className="text-sm font-normal text-muted-foreground">
        Godzina
      </Label>
      <Input
        id="prayer-reminder-time"
        type="time"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="h-9 w-28"
      />
      {isChanged && (
        <Button size="sm" onClick={() => onSave(draft)} disabled={saving}>
          Zapisz
        </Button>
      )}
    </div>
  )
}
