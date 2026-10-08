-- Codzienne przypomnienie o modlitwie o godzinie wybranej przez użytkownika
-- 1. Tabela przypomnień (wiersz = przypomnienie włączone; godzina w strefie Europe/Warsaw)
-- 2. Trigger: zmiana godziny ustala, czy przypomnienie wyjdzie jeszcze dziś
-- 3. Funkcja rezerwująca przypomnienia, których pora właśnie minęła
-- 4. Zadanie pg_cron co minutę → Edge Function send-push (type: reminder)

-- 1. Tabela przypomnień
CREATE TABLE IF NOT EXISTS public.prayer_reminders (
    user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
    remind_at time NOT NULL,
    -- Dzień (Europe/Warsaw), w którym przypomnienie ostatnio wyszło — ochrona przed duplikatami
    last_sent_on date,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_reminders ENABLE ROW LEVEL SECURITY;

-- Użytkownik ustawia tylko godzinę; user_id z auth.uid(), last_sent_on z triggera i Edge Function.
-- REVOKE: domyślne uprawnienia Supabase dają anon/authenticated pełny dostęp do nowych tabel.
REVOKE ALL ON TABLE public.prayer_reminders FROM anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.prayer_reminders TO authenticated;
GRANT INSERT (remind_at), UPDATE (remind_at) ON TABLE public.prayer_reminders TO authenticated;
GRANT ALL ON TABLE public.prayer_reminders TO service_role;

CREATE POLICY "Users manage own prayer reminder"
    ON public.prayer_reminders
    FOR ALL
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- 2. Nowa godzina, która dziś już minęła → pierwsze przypomnienie jutro.
-- Godzina jeszcze przed nami → przypomnienie wyjdzie dziś (nawet jeśli poprzednia już wyszła).
CREATE OR REPLACE FUNCTION public.prayer_reminder_set_last_sent()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
    v_now timestamp := now() AT TIME ZONE 'Europe/Warsaw';
BEGIN
    IF TG_OP = 'INSERT' OR NEW.remind_at IS DISTINCT FROM OLD.remind_at THEN
        NEW.last_sent_on := CASE WHEN NEW.remind_at <= v_now::time THEN v_now::date END;
    END IF;
    RETURN NEW;
END;
$function$;

CREATE TRIGGER on_prayer_reminder_saved
    BEFORE INSERT OR UPDATE ON public.prayer_reminders
    FOR EACH ROW
    EXECUTE FUNCTION public.prayer_reminder_set_last_sent();

-- 3. Rezerwacja przypomnień do wysłania: godzina minęła w ciągu ostatnich 30 minut
-- (zapas na nieudane uruchomienie crona) i dziś jeszcze nie wysłano.
-- Daty liczone w strefie Europe/Warsaw — okno nie przechodzi przez północ, zmiana czasu jest obsłużona.
CREATE OR REPLACE FUNCTION public.claim_due_prayer_reminders()
RETURNS TABLE(user_id uuid)
LANGUAGE sql
SET search_path TO ''
AS $function$
    WITH local_now AS (
        SELECT now() AT TIME ZONE 'Europe/Warsaw' AS ts
    )
    UPDATE public.prayer_reminders r
    SET last_sent_on = l.ts::date
    FROM local_now l
    WHERE (l.ts::date + r.remind_at) BETWEEN l.ts - interval '30 minutes' AND l.ts
      AND (r.last_sent_on IS NULL OR r.last_sent_on < l.ts::date)
    RETURNING r.user_id;
$function$;

REVOKE EXECUTE ON FUNCTION public.claim_due_prayer_reminders() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_due_prayer_reminders() TO service_role;

-- 4. Harmonogram — co minutę; Edge Function wywoływana tylko, gdy ktoś ma teraz przypomnienie.
-- Sekrety w Vault jak dla send-push-daily (README → Powiadomienia push).
SELECT cron.schedule(
    'send-prayer-reminders',
    '* * * * *',
    $$
    SELECT net.http_post(
        url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/send-push',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'push_cron_secret')
        ),
        body := jsonb_build_object('type', 'reminder', 'user_ids', due.user_ids),
        timeout_milliseconds := 30000
    )
    FROM (SELECT array_agg(user_id) AS user_ids FROM public.claim_due_prayer_reminders()) due
    WHERE due.user_ids IS NOT NULL;
    $$
);
