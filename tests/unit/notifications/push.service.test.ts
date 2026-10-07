/**
 * @vitest-environment jsdom
 * Testy push.service - konwersja klucza VAPID i wykrywanie obsługi Web Push
 */

import { describe, it, expect } from 'vitest'
import { pushService, urlBase64ToUint8Array } from '@/features/notifications/api/push.service'

describe('push.service', () => {
  it('konwertuje klucz base64url na bajty (z dopełnieniem i znakami -_)', () => {
    // "-_8" w base64url = "+/8=" w base64 = bajty 0xFB 0xFF
    expect(Array.from(urlBase64ToUint8Array('-_8'))).toEqual([0xfb, 0xff])
    expect(Array.from(urlBase64ToUint8Array('AQID'))).toEqual([1, 2, 3])
  })

  it('zwraca unsupported, gdy przeglądarka nie obsługuje Web Push', async () => {
    // jsdom nie ma PushManager ani klucza VAPID w env
    expect(await pushService.getStatus()).toBe('unsupported')
  })
})
