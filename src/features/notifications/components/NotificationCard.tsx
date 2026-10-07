import { Bell, BellOff, BellRing, Loader2, Share } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { CardLabel } from "@/shared/components/common/CardLabel"
import { usePushNotifications } from "@/features/notifications/hooks/usePushNotifications"

/**
 * Karta włączania powiadomień push o zmianie tajemnicy
 * Ukryta, gdy urządzenie nie obsługuje Web Push
 */
export function NotificationCard() {
  const { status, loading, enable, disable } = usePushNotifications()

  if (!status || status === 'unsupported') return null

  if (status === 'on') {
    return (
      <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
          <BellRing className="h-4 w-4" />
        </span>
        <span className="flex-1 text-sm font-medium text-foreground">
          Powiadomienia włączone
        </span>
        <Button variant="outline" size="sm" onClick={disable} disabled={loading} className="flex-shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Wyłącz"}
        </Button>
      </div>
    )
  }

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      {status === 'denied'
        ? <CardLabel icon={BellOff} tone="muted" className="mb-3">Powiadomienia na telefon</CardLabel>
        : <CardLabel icon={Bell} className="mb-3">Powiadomienia na telefon</CardLabel>}

      {status === 'off' && (
        <>
          <p className="text-[0.9375rem] text-foreground leading-relaxed mb-4">
            Dostaniesz powiadomienie o nowej tajemnicy, nowej intencji i dniach, w których możesz zyskać odpust.
          </p>
          <Button onClick={enable} disabled={loading} className="w-full h-12 text-base font-semibold">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Bell className="mr-2 h-5 w-5" />}
            Włącz powiadomienia
          </Button>
        </>
      )}

      {status === 'ios-install' && (
        <p className="text-[0.9375rem] text-foreground leading-relaxed">
          Na iPhonie powiadomienia działają po dodaniu aplikacji do ekranu początkowego. Stuknij
          {" "}<Share className="inline h-4 w-4 align-text-bottom" aria-label="Udostępnij" />{" "}
          <span className="font-semibold">Udostępnij</span>, wybierz
          {" "}<span className="font-semibold">„Do ekranu początkowego”</span>,
          a potem otwórz aplikację z nowej ikony.
        </p>
      )}

      {status === 'denied' && (
        <p className="text-[0.9375rem] text-foreground leading-relaxed">
          Powiadomienia są zablokowane. Zezwól na nie dla tej aplikacji w ustawieniach telefonu lub przeglądarki.
        </p>
      )}
    </section>
  )
}
