-- Potwierdzenia liczone tylko w bieżącym okresie tajemnic (bez usuwania danych)
-- Problem: tajemnice wracają co 20 miesięcy, a potwierdzenie (unikalne user_id + mystery_id) zostaje
-- w tabeli. Po powrocie tej samej tajemnicy aplikacja od razu pokazywała ją jako potwierdzoną,
-- a nowego potwierdzenia nie dało się zapisać.
-- 1. current_mystery_period_start() — dzień, od którego obowiązuje bieżąca tajemnica
-- 2. get_members_overview — potwierdzenie tylko z bieżącego okresu
-- 3. is_mystery_acknowledged() — status dla panelu użytkownika
-- 4. acknowledge_mystery() — zapis potwierdzenia; ponowne potwierdzenie tej samej tajemnicy
--    (po 20 miesiącach) aktualizuje datę w istniejącym wierszu
-- Bezpośredni INSERT do acknowledgments zostaje (zgodność z wcześniejszą wersją aplikacji).

-- 1. Początek bieżącego okresu: pierwsza niedziela tego miesiąca, a przed nią — poprzedniego
--    (ta sama reguła co w get_mystery_id_for_user / get_mystery_ids_for_users)
CREATE OR REPLACE FUNCTION public.current_mystery_period_start()
RETURNS date
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
    SELECT CASE WHEN now()::date >= s.this_sunday THEN s.this_sunday ELSE s.prev_sunday END
    FROM (
        SELECT
            d.this_month + ((7 - EXTRACT(DOW FROM d.this_month)::integer) % 7) AS this_sunday,
            d.prev_month + ((7 - EXTRACT(DOW FROM d.prev_month)::integer) % 7) AS prev_sunday
        FROM (
            SELECT
                date_trunc('month', now())::date AS this_month,
                (date_trunc('month', now()) - interval '1 month')::date AS prev_month
        ) d
    ) s
$function$;

-- 2. Lista członków: potwierdzenie tylko z bieżącego okresu
CREATE OR REPLACE FUNCTION public.get_members_overview(p_group_id bigint DEFAULT NULL)
RETURNS TABLE (
    id uuid,
    full_name text,
    login text,
    role text,
    rose_pos integer,
    created_at timestamptz,
    group_id bigint,
    group_name text,
    current_mystery_id integer,
    current_mystery_name text,
    acknowledged_at timestamptz
)
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
    WITH members AS (
        SELECT p.id, p.full_name, p.login, p.role, p.rose_pos, p.created_at, p.group_id
        FROM public.profiles p
        WHERE p_group_id IS NULL OR p.group_id = p_group_id
    ),
    current_mystery AS (
        SELECT m.user_id, m.mystery_id
        FROM public.get_mystery_ids_for_users(ARRAY(SELECT members.id FROM members)) m
    )
    SELECT
        mb.id,
        mb.full_name,
        mb.login,
        mb.role,
        mb.rose_pos,
        mb.created_at,
        g.id,
        g.name,
        cm.mystery_id,
        my.name,
        a.created_at
    FROM members mb
    LEFT JOIN public.groups g ON g.id = mb.group_id
    LEFT JOIN current_mystery cm ON cm.user_id = mb.id
    LEFT JOIN public.mysteries my ON my.id = cm.mystery_id
    LEFT JOIN public.acknowledgments a
        ON a.user_id = mb.id
        AND a.mystery_id = cm.mystery_id
        AND a.created_at >= public.current_mystery_period_start()
    ORDER BY
        CASE WHEN p_group_id IS NOT NULL THEN mb.rose_pos END NULLS LAST,
        mb.full_name
$function$;

-- 3. Czy zalogowany użytkownik potwierdził tajemnicę w bieżącym okresie
CREATE OR REPLACE FUNCTION public.is_mystery_acknowledged(p_mystery_id integer)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.acknowledgments a
        WHERE a.user_id = (SELECT auth.uid())
          AND a.mystery_id = p_mystery_id
          AND a.created_at >= public.current_mystery_period_start()
    )
$function$;

-- 4. Potwierdzenie bieżącej tajemnicy zalogowanego użytkownika
-- SECURITY DEFINER: aktualizacja daty w istniejącym wierszu bez dawania użytkownikom prawa UPDATE;
-- wpis zawsze dla auth.uid() i tylko dla jego bieżącej tajemnicy, z czasem serwera.
CREATE OR REPLACE FUNCTION public.acknowledge_mystery(p_mystery_id integer)
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

    IF p_mystery_id IS DISTINCT FROM public.get_mystery_id_for_user(v_user_id) THEN
        RAISE EXCEPTION 'Tajemnica zmieniła się. Odśwież stronę.';
    END IF;

    INSERT INTO public.acknowledgments (user_id, mystery_id)
    VALUES (v_user_id, p_mystery_id)
    ON CONFLICT (user_id, mystery_id) DO UPDATE
        SET created_at = now()
        WHERE public.acknowledgments.created_at < public.current_mystery_period_start();
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.is_mystery_acknowledged(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_mystery_acknowledged(integer) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.acknowledge_mystery(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.acknowledge_mystery(integer) TO authenticated;
