import { Bell, BellOff, BellRing, Loader2, Share } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
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
        <BellRing className="h-5 w-5 text-primary flex-shrink-0" />
        <span className="flex-1 text-sm text-muted-foreground">
          Powiadomienia włączone
        </span>
        <Button variant="ghost" size="sm" onClick={disable} disabled={loading} className="flex-shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Wyłącz"}
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {status === 'denied'
          ? <BellOff className="h-5 w-5 text-muted-foreground" />
          : <Bell className="h-5 w-5 text-primary" />}
        <h3 className="text-sm font-semibold text-foreground/90">Powiadomienia na telefon</h3>
      </div>

      {status === 'off' && (
        <>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Dostaniesz powiadomienie o nowej tajemnicy, nowej intencji i dniach, w których możesz zyskać odpust.
          </p>
          <Button onClick={enable} disabled={loading} className="w-full h-12 text-base font-semibold">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Bell className="mr-2 h-5 w-5" />}
            Włącz powiadomienia
          </Button>
        </>
      )}

      {status === 'ios-install' && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Na iPhonie powiadomienia działają po dodaniu aplikacji do ekranu początkowego. Stuknij
          {" "}<Share className="inline h-4 w-4 align-text-bottom" aria-label="Udostępnij" />{" "}
          <span className="font-medium text-foreground/80">Udostępnij</span>, wybierz
          {" "}<span className="font-medium text-foreground/80">„Do ekranu początkowego”</span>,
          a potem otwórz aplikację z nowej ikony.
        </p>
      )}

      {status === 'denied' && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Powiadomienia są zablokowane. Zezwól na nie dla tej aplikacji w ustawieniach telefonu lub przeglądarki.
        </p>
      )}
    </div>
  )
}
