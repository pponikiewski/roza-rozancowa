/**
 * Testy queryPersistence - dane panelu zapamiętane między uruchomieniami
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { persistQueryCache, restoreQueryCache } from '@/shared/lib/queryPersistence'

const STORAGE_KEY = 'roza-query-cache'

/** Zapis cache w chwili `savedAt` z danymi pobranymi w podanych momentach */
function saveCache(savedAt: string, entries: [readonly unknown[], unknown, string][]) {
  vi.setSystemTime(new Date(savedAt))
  const source = new QueryClient()
  const unsubscribe = persistQueryCache(source)
  for (const [key, data, fetchedAt] of entries) {
    source.setQueryData(key, data, { updatedAt: new Date(fetchedAt).getTime() })
  }
  vi.advanceTimersByTime(1000)
  unsubscribe()
}

/** Uruchomienie aplikacji w chwili `now` */
function restoreAt(now: string) {
  vi.setSystemTime(new Date(now))
  const client = new QueryClient()
  restoreQueryCache(client)
  return client
}

describe('queryPersistence', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('zapisuje tylko dane panelu', () => {
    saveCache('2026-10-09T12:00:00Z', [
      [['mystery', 7], { id: 7 }, '2026-10-09T11:00:00Z'],
      [['admin-members'], [{ id: 'x' }], '2026-10-09T11:00:00Z'],
    ])

    const client = restoreAt('2026-10-09T13:00:00Z')

    expect(client.getQueryData(['mystery', 7])).toEqual({ id: 7 })
    expect(client.getQueryData(['admin-members'])).toBeUndefined()
  })

  it('odrzuca ID tajemnicy i status sprzed bieżącego okresu (1. niedziela, UTC)', () => {
    // Październik 2026: pierwsza niedziela 4.10
    saveCache('2026-10-09T12:00:00Z', [
      [['mystery-id', 'u1'], 7, '2026-10-04T00:30:00Z'],
      [['acknowledgment', 'u1', 7], true, '2026-10-03T23:00:00Z'],
    ])

    const client = restoreAt('2026-10-09T13:00:00Z')

    expect(client.getQueryData(['mystery-id', 'u1'])).toBe(7)
    expect(client.getQueryData(['acknowledgment', 'u1', 7])).toBeUndefined()
  })

  it('przed 1. niedzielą miesiąca okres zaczyna się w poprzednim miesiącu', () => {
    // 2.10.2026 (przed 4.10) — okres od 6.09.2026
    saveCache('2026-10-02T12:00:00Z', [
      [['mystery-id', 'u1'], 6, '2026-09-10T12:00:00Z'],
      [['mystery-id', 'u2'], 5, '2026-09-05T12:00:00Z'],
    ])

    const client = restoreAt('2026-10-02T13:00:00Z')

    expect(client.getQueryData(['mystery-id', 'u1'])).toBe(6)
    expect(client.getQueryData(['mystery-id', 'u2'])).toBeUndefined()
  })

  it('odrzuca intencję z poprzedniego miesiąca i odpusty z innego dnia', () => {
    const today = new Date('2026-10-15T12:00:00Z').toDateString()
    const yesterday = new Date('2026-10-14T12:00:00Z').toDateString()
    saveCache('2026-10-15T12:00:00Z', [
      [['intention'], { title: 'Wrzesień' }, '2026-09-20T12:00:00Z'],
      [['indulgences-today', today, 1], [], '2026-10-15T11:00:00Z'],
      [['indulgences-today', yesterday, 1], [], '2026-10-14T11:00:00Z'],
    ])

    const client = restoreAt('2026-10-15T13:00:00Z')

    expect(client.getQueryData(['intention'])).toBeUndefined()
    expect(client.getQueryData(['indulgences-today', today, 1])).toEqual([])
    expect(client.getQueryData(['indulgences-today', yesterday, 1])).toBeUndefined()
  })

  it('pomija zapis starszy niż 7 dni lub z innej wersji', () => {
    saveCache('2026-10-01T12:00:00Z', [[['mystery', 7], { id: 7 }, '2026-10-01T12:00:00Z']])
    expect(restoreAt('2026-10-09T12:00:00Z').getQueryData(['mystery', 7])).toBeUndefined()

    saveCache('2026-10-09T12:00:00Z', [[['mystery', 7], { id: 7 }, '2026-10-09T12:00:00Z']])
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, version: 0 }))
    expect(restoreAt('2026-10-09T13:00:00Z').getQueryData(['mystery', 7])).toBeUndefined()
  })

  it('po wyczyszczeniu cache (wylogowanie) zapisuje pusty stan', () => {
    vi.setSystemTime(new Date('2026-10-09T12:00:00Z'))
    const client = new QueryClient()
    persistQueryCache(client)
    client.setQueryData(['profile', 'u1'], { role: 'user' })
    vi.advanceTimersByTime(1000)

    client.clear()
    vi.advanceTimersByTime(1000)

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).state.queries).toEqual([])
  })
})
