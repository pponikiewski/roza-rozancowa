-- Wybór powiadomień przez użytkownika: nowa tajemnica, nowa intencja, dni odpustu
-- (codzienne przypomnienie o modlitwie ma osobną tabelę prayer_reminders).
-- Brak wiersza = wszystkie typy włączone; Edge Function send-push pomija wyłączone.

CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
    mystery boolean NOT NULL DEFAULT true,
    intention boolean NOT NULL DEFAULT true,
    indulgence boolean NOT NULL DEFAULT true
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Użytkownik zmienia tylko przełączniki; user_id z auth.uid().
-- REVOKE: domyślne uprawnienia Supabase dają anon/authenticated pełny dostęp do nowych tabel.
REVOKE ALL ON TABLE public.notification_preferences FROM anon, authenticated;
GRANT SELECT ON TABLE public.notification_preferences TO authenticated;
GRANT INSERT (mystery, intention, indulgence), UPDATE (mystery, intention, indulgence)
    ON TABLE public.notification_preferences TO authenticated;
GRANT ALL ON TABLE public.notification_preferences TO service_role;

CREATE POLICY "Users manage own notification preferences"
    ON public.notification_preferences
    FOR ALL
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
