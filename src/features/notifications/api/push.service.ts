import { supabase } from '@/shared/lib/supabase'
import type { PushStatus } from '@/features/notifications/types/push.types'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
const SW_READY_TIMEOUT_MS = 10_000

/**
 * Konwersja klucza VAPID (base64url) do formatu wymaganego przez PushManager
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

/** iPhone/iPad (iPadOS przedstawia się jako Mac z ekranem dotykowym) */
function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/** Aplikacja uruchomiona z ikony na ekranie głównym */
function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

async function getSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration()
  return (await registration?.pushManager.getSubscription()) ?? null
}

/** Czeka na aktywny service worker (przy pierwszej wizycie może się jeszcze instalować) */
function waitForServiceWorker(): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Service worker niedostępny. Odśwież stronę i spróbuj ponownie.')), SW_READY_TIMEOUT_MS)
    ),
  ])
}

async function saveSubscription(subscription: PushSubscription): Promise<void> {
  const { endpoint, keys } = subscription.toJSON()
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error('Niepełne dane subskrypcji')
  }

  const { error } = await supabase.rpc('save_push_subscription', {
    p_endpoint: endpoint,
    p_p256dh: keys.p256dh,
    p_auth: keys.auth,
  })
  if (error) throw error
}

async function deleteSubscription(endpoint: string): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
  if (error) throw error
}

/**
 * Serwis obsługujący powiadomienia push (Web Push)
 */
export const pushService = {
  /**
   * Stan powiadomień na tym urządzeniu.
   * Jeśli urządzenie ma aktywną subskrypcję, ponownie zapisuje ją w bazie
   * (synchronizacja po wygaśnięciu sesji lub zmianie użytkownika).
   */
  async getStatus(): Promise<PushStatus> {
    if (!VAPID_PUBLIC_KEY) return 'unsupported'
    // Na iOS push działa tylko w aplikacji dodanej do ekranu głównego
    if (isIos() && !isStandalone()) return 'ios-install'
    if (!isPushSupported()) return 'unsupported'
    if (Notification.permission === 'denied') return 'denied'

    const subscription = await getSubscription()
    if (!subscription || Notification.permission !== 'granted') return 'off'

    await saveSubscription(subscription)
    return 'on'
  },

  /**
   * Prośba o zgodę i zapis subskrypcji. Wywoływać tylko po kliknięciu użytkownika (wymóg iOS).
   */
  async enable(): Promise<PushStatus> {
    const permission = await Notification.requestPermission()
    if (permission === 'denied') return 'denied'
    if (permission !== 'granted') return 'off'

    const registration = await waitForServiceWorker()
    const subscription = await registration.pushManager.getSubscription()
      ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
      })

    await saveSubscription(subscription)
    return 'on'
  },

  /**
   * Wyłączenie powiadomień na tym urządzeniu
   */
  async disable(): Promise<PushStatus> {
    const subscription = await getSubscription()
    if (subscription) {
      await deleteSubscription(subscription.endpoint)
      await subscription.unsubscribe()
    }
    return 'off'
  },

  /**
   * Wyłączenie powiadomień przy wylogowaniu — kolejny użytkownik urządzenia
   * nie dostanie powiadomień poprzedniego. Błędy są ignorowane, by nie blokować wylogowania.
   */
  async disableOnLogout(): Promise<void> {
    if (!isPushSupported()) return
    try {
      await pushService.disable()
    } catch {
      // Brak sieci / brak SW — subskrypcja zostanie przejęta przy następnym zapisie
    }
  },
}
