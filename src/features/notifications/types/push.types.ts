/**
 * Stan powiadomień push na bieżącym urządzeniu
 * - unsupported: przeglądarka nie obsługuje Web Push (lub brak klucza VAPID)
 * - ios-install: iPhone/iPad poza aplikacją z ekranu głównego
 * - denied: użytkownik zablokował powiadomienia
 * - off: obsługiwane, ale niewłączone
 * - on: urządzenie zapisane do powiadomień
 */
export type PushStatus = 'unsupported' | 'ios-install' | 'denied' | 'off' | 'on'

/** Typy powiadomień, które użytkownik może wyłączyć (przypomnienie o modlitwie — osobno) */
export type NotificationKind = 'mystery' | 'intention' | 'indulgence'

export type NotificationPreferences = Record<NotificationKind, boolean>
