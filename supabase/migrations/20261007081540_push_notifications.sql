-- Powiadomienia push (Web Push)
-- Typy powiadomień: nowa tajemnica (1. niedziela miesiąca), nowa intencja, dzień odpustu
-- 1. Tabela subskrypcji push (jedno urządzenie/przeglądarka = jeden endpoint)
-- 2. Funkcja zapisu subskrypcji
-- 3. Dziennik wysłanych powiadomień (ochrona przed duplikatami)
-- 4. Dni odpustowe (zarządzane w panelu admina)
-- 5. Trigger: nowa intencja na bieżący miesiąc → natychmiastowa wysyłka
-- 6. Codzienne zadanie pg_cron wywołujące Edge Function send-push

-- 1. Tabela subskrypcji
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint text NOT NULL UNIQUE,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, DELETE ON TABLE public.push_subscriptions TO authenticated;
GRANT ALL ON TABLE public.push_subscriptions TO service_role;

CREATE POLICY "Users see own push subscriptions"
    ON public.push_subscriptions
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users delete own push subscriptions"
    ON public.push_subscriptions
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- 2. Zapis subskrypcji
-- SECURITY DEFINER, bo endpoint może być przypisany do poprzednio zalogowanego użytkownika
-- (to samo urządzenie). Znajomość endpointu = kontrola nad urządzeniem, więc przejęcie jest bezpieczne.
-- Wpis zawsze trafia do auth.uid() — nie da się zapisać subskrypcji na innego użytkownika.
CREATE OR REPLACE FUNCTION public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Brak zalogowanego użytkownika';
    END IF;

    INSERT INTO public.push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (v_user_id, p_endpoint, p_p256dh, p_auth)
    ON CONFLICT (endpoint) DO UPDATE
        SET user_id = EXCLUDED.user_id,
            p256dh = EXCLUDED.p256dh,
            auth = EXCLUDED.auth,
            updated_at = now();
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.save_push_subscription(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_push_subscription(text, text, text) TO authenticated;

-- 3. Dziennik wysłanych powiadomień
-- Klucz np. 'mystery:2026-11', 'intention:2026-11', 'indulgence:2026-10-07'.
-- Edge Function zapisuje klucz przed wysyłką — każde powiadomienie wychodzi tylko raz.
-- Dostęp wyłącznie dla service_role (RLS bez polityk).
CREATE TABLE IF NOT EXISTS public.push_notification_log (
    key text PRIMARY KEY,
    sent_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_notification_log ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.push_notification_log TO service_role;

-- 4. Dni odpustowe
-- year IS NULL → odpust co roku w danym dniu; year ustawiony → tylko w tym roku (np. święta ruchome)
CREATE TABLE IF NOT EXISTS public.indulgence_days (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL CHECK (char_length(name) BETWEEN 3 AND 200),
    description text CHECK (char_length(description) <= 1000),
    month smallint NOT NULL CHECK (month BETWEEN 1 AND 12),
    day smallint NOT NULL CHECK (day BETWEEN 1 AND 31),
    year integer,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.indulgence_days ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.indulgence_days TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.indulgence_days TO authenticated;
GRANT ALL ON TABLE public.indulgence_days TO service_role;

CREATE POLICY "Authenticated read indulgence days"
    ON public.indulgence_days
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin manages indulgence days"
    ON public.indulgence_days
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Lista startowa dni odpustowych — uzupełnić
-- INSERT INTO public.indulgence_days (name, description, month, day) VALUES
--     ('Święto Matki Bożej Różańcowej', 'Warunki: ...', 10, 7);

-- 5. Nowa intencja na bieżący miesiąc → wywołanie Edge Function
-- SECURITY DEFINER: odczyt sekretów z Vault (admin zapisujący intencję nie ma do nich dostępu).
-- Funkcja zwraca trigger, więc nie da się jej wywołać przez API.
CREATE OR REPLACE FUNCTION public.notify_new_intention()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_url text;
    v_secret text;
BEGIN
    IF NEW.month <> EXTRACT(MONTH FROM now()) OR NEW.year <> EXTRACT(YEAR FROM now()) THEN
        RETURN NEW;
    END IF;

    SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'project_url';
    SELECT decrypted_secret INTO v_secret FROM vault.decrypted_secrets WHERE name = 'push_cron_secret';

    -- Brak konfiguracji push (np. lokalna baza) — zapis intencji nie może się przez to nie udać
    IF v_url IS NULL OR v_secret IS NULL THEN
        RETURN NEW;
    END IF;

    PERFORM net.http_post(
        url := v_url || '/functions/v1/send-push',
        headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', v_secret),
        body := jsonb_build_object('type', 'intention')
    );

    RETURN NEW;
END;
$function$;

-- Ponowny zapis tej samej intencji nie wyśle drugiego powiadomienia (dziennik w Edge Function)
CREATE TRIGGER on_intention_saved
    AFTER INSERT OR UPDATE ON public.intentions
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_intention();

-- 6. Harmonogram
-- Wymaga sekretów w Vault (patrz README → Powiadomienia push):
--   project_url       — https://<project-ref>.supabase.co
--   push_cron_secret  — ta sama wartość co sekret CRON_SECRET Edge Function
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Codziennie o 7:00 UTC (8:00/9:00 w Polsce). Edge Function sama sprawdza,
-- czy dziś jest pierwsza niedziela, nowa intencja lub dzień odpustu.
SELECT cron.schedule(
    'send-push-daily',
    '0 7 * * *',
    $$
    SELECT net.http_post(
        url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/send-push',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'push_cron_secret')
        ),
        body := '{"type": "daily"}'::jsonb,
        timeout_milliseconds := 30000
    );
    $$
);
