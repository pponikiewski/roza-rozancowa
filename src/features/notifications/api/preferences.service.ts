import { supabase } from '@/shared/lib/supabase'
import type { NotificationKind, NotificationPreferences } from '@/features/notifications/types/push.types'

/** Brak zapisanego wyboru = wszystkie powiadomienia włączone (tak samo w Edge Function send-push) */
export const DEFAULT_PREFERENCES: NotificationPreferences = {
  mystery: true,
  intention: true,
  indulgence: true,
}

/**
 * Serwis wyboru powiadomień użytkownika (nowa tajemnica, nowa intencja, dni odpustu)
 */
export const preferencesService = {
  async get(userId: string): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('mystery, intention, indulgence')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return data ?? DEFAULT_PREFERENCES
  },

  /** Zmiana jednego typu; pozostałe zostają bez zmian (user_id ustawia baza z auth.uid()) */
  async set(kind: NotificationKind, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ [kind]: enabled }, { onConflict: 'user_id' })
    if (error) throw error
  },
}
