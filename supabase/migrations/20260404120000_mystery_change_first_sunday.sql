-- Zmiana rotacji tajemnic: z 1. dnia miesiąca na 1. niedzielę miesiąca
-- Przed pierwszą niedzielą danego miesiąca użytkownik wciąż ma tajemnicę z poprzedniego miesiąca

CREATE OR REPLACE FUNCTION public.get_mystery_id_for_user(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $function$
DECLARE
    start_date date := '2024-01-01';
    months_passed integer;
    user_pos integer;
    calculated_id integer;
    first_of_month date;
    dow_first integer;
    first_sunday date;
BEGIN
    SELECT rose_pos INTO user_pos FROM public.profiles WHERE id = p_user_id;

    IF user_pos IS NULL THEN
        RETURN NULL;
    END IF;

    -- Oblicz miesiące kalendarzowe od daty startu
    SELECT EXTRACT(YEAR FROM age(now(), start_date)) * 12 +
           EXTRACT(MONTH FROM age(now(), start_date)) INTO months_passed;

    -- Znajdź pierwszą niedzielę bieżącego miesiąca
    first_of_month := date_trunc('month', now())::date;
    dow_first := EXTRACT(DOW FROM first_of_month); -- 0=niedziela, 1=poniedziałek, ...
    first_sunday := first_of_month + ((7 - dow_first) % 7)::integer;

    -- Jeśli jeszcze nie było pierwszej niedzieli, tajemnica z poprzedniego miesiąca
    IF now()::date < first_sunday THEN
        months_passed := months_passed - 1;
    END IF;

    calculated_id := ((user_pos - 1 + months_passed) % 20) + 1;

    RETURN calculated_id;
END;
$function$;

-- Batch version (eliminuje N+1)
CREATE OR REPLACE FUNCTION public.get_mystery_ids_for_users(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, mystery_id integer)
LANGUAGE plpgsql
AS $function$
DECLARE
    start_date date := '2024-01-01';
    months_passed integer;
    first_of_month date;
    dow_first integer;
    first_sunday date;
BEGIN
    -- Oblicz miesiące kalendarzowe od daty startu
    SELECT EXTRACT(YEAR FROM age(now(), start_date)) * 12 +
           EXTRACT(MONTH FROM age(now(), start_date)) INTO months_passed;

    -- Znajdź pierwszą niedzielę bieżącego miesiąca
    first_of_month := date_trunc('month', now())::date;
    dow_first := EXTRACT(DOW FROM first_of_month);
    first_sunday := first_of_month + ((7 - dow_first) % 7)::integer;

    -- Jeśli jeszcze nie było pierwszej niedzieli, tajemnica z poprzedniego miesiąca
    IF now()::date < first_sunday THEN
        months_passed := months_passed - 1;
    END IF;

    RETURN QUERY
    SELECT
        p.id as user_id,
        CASE
            WHEN p.rose_pos IS NULL THEN NULL
            ELSE ((p.rose_pos - 1 + months_passed) % 20) + 1
        END as mystery_id
    FROM public.profiles p
    WHERE p.id = ANY(p_user_ids);
END;
$function$;
