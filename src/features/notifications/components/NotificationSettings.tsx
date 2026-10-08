import { Loader2, Share } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { usePushNotifications } from "@/features/notifications/hooks/usePushNotifications"
import { NotificationPreferences } from "@/features/notifications/components/NotificationPreferences"

/**
 * Sekcja powiadomień push w panelu konta (nowa tajemnica, intencja, dni odpustu,
 * codzienne przypomnienie o modlitwie)
 * Ukryta, gdy urządzenie nie obsługuje Web Push
 */
export function NotificationSettings() {
  const { status, loading, enable, disable } = usePushNotifications()

  if (!status || status === 'unsupported') return null

  const isOn = status === 'on'

  return (
    <section className="border-t px-5 py-4">
      <h3 className="mb-2 text-base font-semibold">Powiadomienia</h3>

      {(status === 'off' || isOn) && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <p className="text-[0.9375rem] text-foreground">Na telefon</p>
              <p className="text-sm text-muted-foreground">{isOn ? "Włączone" : "Wyłączone"}</p>
            </div>
            <Button
              size="sm"
              variant={isOn ? "outline" : "default"}
              onClick={isOn ? disable : enable}
              disabled={loading}
              className="min-w-[5.5rem]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isOn ? "Wyłącz" : "Włącz"}
            </Button>
          </div>
          {isOn ? (
            <NotificationPreferences />
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              O nowej tajemnicy, nowej intencji i dniach, w których możesz zyskać odpust.
              Możesz też ustawić codzienne przypomnienie o modlitwie.
            </p>
          )}
        </>
      )}

      {status === 'ios-install' && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Na iPhonie powiadomienia działają po dodaniu aplikacji do ekranu początkowego. Stuknij
          {" "}<Share className="inline h-4 w-4 align-text-bottom" aria-label="Udostępnij" />{" "}
          <span className="font-semibold text-foreground">Udostępnij</span>, wybierz
          {" "}<span className="font-semibold text-foreground">„Do ekranu początkowego”</span>,
          a potem otwórz aplikację z nowej ikony.
        </p>
      )}

      {status === 'denied' && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Powiadomienia są zablokowane. Zezwól na nie dla tej aplikacji w ustawieniach telefonu lub przeglądarki.
        </p>
      )}
    </section>
  )
}
