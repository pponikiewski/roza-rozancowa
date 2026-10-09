-- Bezpieczeństwo: funkcje admina z kontrolą roli, mniej danych dla anonima i zwykłego użytkownika
--
-- 1. move_user_to_group i rotate_group_members (SECURITY DEFINER, z pierwszej wersji schematu) nie
--    sprawdzały roli, a prawo wykonania miał każdy — także anon z kluczem publicznym ze strony.
--    Dało się wyrzucić dowolną osobę z Róży albo obrócić tajemnice w dowolnej Róży i skasować
--    potwierdzenia. Teraz tylko admin; pusty search_path jak w nowszych funkcjach.
-- 2. generate_login tylko dla triggera przy tworzeniu konta (service_role) — anon mógł sprawdzać,
--    czy osoba o danym imieniu ma konto.
-- 3. groups i intentions: odczyt tylko po zalogowaniu (anon widział ID Róż — wystarczały do pkt 1 — i intencje).
-- 4. profiles.email: niewidoczne dla użytkowników. Kolumna z pierwszej wersji schematu, aplikacja jej
--    nie używa (logowanie przez auth.users), a może zawierać prawdziwy adres.
--    Nowe kolumny profiles trzeba dopisać do GRANT SELECT poniżej.
-- 5. acknowledgments: zapis tylko przez acknowledge_mystery (sprawdza tajemnicę i ustawia czas serwera);
--    usuwanie przez funkcje admina.

-- 1. Funkcje admina
CREATE OR REPLACE FUNCTION public.move_user_to_group(p_user_id uuid, p_group_id bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    free_pos integer;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Brak uprawnień administratora' USING ERRCODE = '42501';
    END IF;

    -- Usunięcie z Róży
    IF p_group_id IS NULL THEN
        UPDATE public.profiles
        SET group_id = NULL, rose_pos = NULL
        WHERE id = p_user_id;

        DELETE FROM public.acknowledgments WHERE user_id = p_user_id;

        RETURN 0;
    END IF;

    -- Przeniesienie: pierwsze wolne miejsce (1-20)
    SELECT s.i
    FROM generate_series(1, 20) AS s(i)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE group_id = p_group_id AND rose_pos = s.i
    )
    ORDER BY s.i
    LIMIT 1
    INTO free_pos;

    IF free_pos IS NULL THEN
        RAISE EXCEPTION 'Ta róża jest pełna (20 osób)! Nie można przenieść.';
    END IF;

    UPDATE public.profiles
    SET group_id = p_group_id,
        rose_pos = free_pos
    WHERE id = p_user_id;

    -- Nowa pozycja to nowa tajemnica — stare potwierdzenia nieaktualne
    DELETE FROM public.acknowledgments WHERE user_id = p_user_id;

    RETURN free_pos;
END;
$function$;

CREATE OR REPLACE FUNCTION public.rotate_group_members(p_group_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Brak uprawnień administratora' USING ERRCODE = '42501';
    END IF;

    -- Nowe tajemnice — stare potwierdzenia nieaktualne
    DELETE FROM public.acknowledgments
    WHERE user_id IN (
        SELECT id FROM public.profiles WHERE group_id = p_group_id
    );

    -- Rotacja pozycji: 1->2, 2->3 ... 20->1
    UPDATE public.profiles
    SET rose_pos = CASE
        WHEN rose_pos >= 20 THEN 1
        ELSE rose_pos + 1
    END
    WHERE group_id = p_group_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.move_user_to_group(uuid, bigint) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rotate_group_members(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.move_user_to_group(uuid, bigint) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rotate_group_members(bigint) TO authenticated, service_role;

-- 2. Login generowany tylko przy tworzeniu konta (trigger set_login_on_insert, wstawia service_role)
REVOKE EXECUTE ON FUNCTION public.generate_login(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_login(text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.get_mystery_ids_for_users(uuid[]) FROM PUBLIC, anon;

-- 3. Odczyt Róż i intencji po zalogowaniu
DROP POLICY IF EXISTS "Każdy widzi grupy" ON public.groups;
CREATE POLICY "Logged-in users read groups"
    ON public.groups FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can read intentions" ON public.intentions;
CREATE POLICY "Logged-in users read intentions"
    ON public.intentions FOR SELECT TO authenticated USING (true);

-- 4. Profile bez kolumny email
REVOKE SELECT ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT (id, full_name, role, group_id, created_at, rose_pos, login) ON TABLE public.profiles TO authenticated;

-- 5. Potwierdzenia tylko przez acknowledge_mystery
DROP POLICY IF EXISTS "Users can insert own" ON public.acknowledgments;
DROP POLICY IF EXISTS "Users can delete own" ON public.acknowledgments;
