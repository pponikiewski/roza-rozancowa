set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_my_group_id()
 RETURNS bigint
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT group_id FROM profiles WHERE id = auth.uid();
$function$
;

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
$function$
;

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
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.move_user_to_group(p_user_id uuid, p_group_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    free_pos integer;
BEGIN
    -- SCENARIUSZ 1: Wyrzucamy z grupy (ustawiamy brak)
    IF p_group_id IS NULL THEN
        UPDATE public.profiles
        SET group_id = NULL, rose_pos = NULL
        WHERE id = p_user_id;
        
        -- Czyścimy potwierdzenia
        DELETE FROM public.acknowledgments WHERE user_id = p_user_id;
        
        RETURN 0;
    END IF;

    -- SCENARIUSZ 2: Przenosimy do nowej grupy
    -- Szukamy pierwszego wolnego miejsca (1-20)
    SELECT s.i
    FROM generate_series(1, 20) AS s(i)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE group_id = p_group_id AND rose_pos = s.i
    )
    ORDER BY s.i
    LIMIT 1
    INTO free_pos;

    -- Jeśli nie ma miejsca
    IF free_pos IS NULL THEN
        RAISE EXCEPTION 'Ta róża jest pełna (20 osób)! Nie można przenieść.';
    END IF;

    -- Aktualizujemy profil
    UPDATE public.profiles
    SET group_id = p_group_id,
        rose_pos = free_pos
    WHERE id = p_user_id;

    -- Czyścimy stare potwierdzenia (bo nowa tajemnica to nowe wyzwanie)
    DELETE FROM public.acknowledgments WHERE user_id = p_user_id;

    RETURN free_pos;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rotate_group_members(p_group_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- 1. Czyścimy potwierdzenia dla tej grupy (bo dostają nowe tajemnice)
  delete from public.acknowledgments
  where user_id in (
    select id from public.profiles where group_id = p_group_id
  );

  -- 2. Rotacja pozycji: 1->2, 2->3 ... 20->1
  -- Używamy tymczasowej logiki, aby uniknąć konfliktów unikalności (jeśli są)
  update public.profiles
  set rose_pos = case
      when rose_pos >= 20 then 1
      else rose_pos + 1
  end
  where group_id = p_group_id;
end;
$function$
;

drop trigger if exists "objects_delete_delete_prefix" on "storage"."objects";

drop trigger if exists "objects_insert_create_prefix" on "storage"."objects";

drop trigger if exists "objects_update_create_prefix" on "storage"."objects";

drop trigger if exists "prefixes_create_hierarchy" on "storage"."prefixes";

drop trigger if exists "prefixes_delete_hierarchy" on "storage"."prefixes";

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


