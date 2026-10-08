import { supabase } from '@/shared/lib/supabase'

/**
 * Serwis codziennego przypomnienia o modlitwie.
 * Godzina w formacie "HH:MM" (strefa Europe/Warsaw); brak wiersza = przypomnienie wyłączone.
 * Wysyłkę obsługuje Edge Function send-push uruchamiana przez pg_cron co minutę.
 */
export const reminderService = {
  /** Godzina przypomnienia albo null, gdy wyłączone */
  async getTime(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('prayer_reminders')
      .select('remind_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    // Postgres zwraca "HH:MM:SS"
    return data ? data.remind_at.slice(0, 5) : null
  },

  /** Włączenie lub zmiana godziny (user_id ustawia baza z auth.uid()) */
  async setTime(time: string): Promise<void> {
    const { error } = await supabase
      .from('prayer_reminders')
      .upsert({ remind_at: time }, { onConflict: 'user_id' })
    if (error) throw error
  },

  async disable(userId: string): Promise<void> {
    const { error } = await supabase
      .from('prayer_reminders')
      .delete()
      .eq('user_id', userId)
    if (error) throw error
  },
}
