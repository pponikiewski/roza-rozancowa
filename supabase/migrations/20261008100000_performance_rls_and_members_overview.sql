-- Wydajność bazy (bez zmiany uprawnień)
-- 1. Indeks na profiles.group_id (skład Róży, rotacja, przenoszenie, powiadomienia)
-- 2. Funkcje tajemnic i is_admin() jako STABLE
-- 3. Polityki RLS: auth.uid() i is_admin() liczone raz na zapytanie, a nie dla każdego wiersza
--    ((select ...) zamiast wywołania), bez zdublowanych polityk
-- 4. get_members_overview() — członkowie z bieżącą tajemnicą i statusem potwierdzenia w jednym zapytaniu
--    (zamiast pobierania całej historii potwierdzeń i osobnych zapytań o tajemnice)

-- 1. Indeks
CREATE INDEX IF NOT EXISTS profiles_group_id_idx ON public.profiles (group_id);

-- 2. Funkcje bez efektów ubocznych — planner może je wywołać raz na zapytanie
ALTER FUNCTION public.is_admin() STABLE;
ALTER FUNCTION public.get_my_group_id() STABLE;
ALTER FUNCTION public.get_mystery_id_for_user(uuid) STABLE;
ALTER FUNCTION public.get_mystery_ids_for_users(uuid[]) STABLE;

-- 3. Polityki RLS
-- Zachowują dotychczasowe uprawnienia. Usunięte polityki były identyczne z innymi
-- albo zawierały się w polityce USING (true).

-- acknowledgments
DROP POLICY IF EXISTS "Insert Policy" ON public.acknowledgments; -- duplikat "Users can insert own"
DROP POLICY IF EXISTS "Users can insert own" ON public.acknowledgments;
DROP POLICY IF EXISTS "Users can delete own" ON public.acknowledgments;
DROP POLICY IF EXISTS "Users see own, Admin sees all" ON public.acknowledgments;

CREATE POLICY "Users can insert own"
    ON public.acknowledgments
    FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own"
    ON public.acknowledgments
    FOR DELETE
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users see own, Admin sees all"
    ON public.acknowledgments
    FOR SELECT
    USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

-- groups: odczyt dla wszystkich, zapis tylko admin
-- (polityka FOR ALL admina dokładała drugie sprawdzenie przy każdym odczycie)
DROP POLICY IF EXISTS "Read access for authenticated" ON public.groups; -- zawiera się w "Każdy widzi grupy"
DROP POLICY IF EXISTS "Admin full access to groups" ON public.groups;

CREATE POLICY "Admin inserts groups"
    ON public.groups
    FOR INSERT
    WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admin updates groups"
    ON public.groups
    FOR UPDATE
    USING ((SELECT public.is_admin()))
    WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admin deletes groups"
    ON public.groups
    FOR DELETE
    USING ((SELECT public.is_admin()));

-- intentions: tylko usunięcie duplikatu odczytu
-- (uprawnienia zapisu bez zmian — do osobnej poprawki bezpieczeństwa)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.intentions; -- duplikat "Anyone can read intentions"

-- profiles
-- Odczyt: "Każdy widzi profile" (USING true) obejmuje pozostałe polityki odczytu
DROP POLICY IF EXISTS "Allow Read All" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon to read login for auth" ON public.profiles;
-- service_role i tak omija RLS; zostaje jedna z dwóch identycznych polityk
DROP POLICY IF EXISTS "Enable all access for service role" ON public.profiles;
-- Edycja: trzy polityki sprowadzały się do "własny profil albo admin"
DROP POLICY IF EXISTS "Allow Update Own" ON public.profiles;
DROP POLICY IF EXISTS "User edytuje siebie" ON public.profiles;
DROP POLICY IF EXISTS "Profile Update" ON public.profiles;

CREATE POLICY "Profile Update"
    ON public.profiles
    FOR UPDATE
    USING ((SELECT auth.uid()) = id OR (SELECT public.is_admin()));

-- indulgence_days: odczyt dla zalogowanych, zapis tylko admin
DROP POLICY IF EXISTS "Admin manages indulgence days" ON public.indulgence_days;

CREATE POLICY "Admin inserts indulgence days"
    ON public.indulgence_days
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admin updates indulgence days"
    ON public.indulgence_days
    FOR UPDATE
    TO authenticated
    USING ((SELECT public.is_admin()))
    WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admin deletes indulgence days"
    ON public.indulgence_days
    FOR DELETE
    TO authenticated
    USING ((SELECT public.is_admin()));

-- 4. Członkowie z bieżącą tajemnicą i statusem potwierdzenia
-- p_group_id NULL → wszyscy (panel admina, kolejność alfabetyczna),
-- p_group_id ustawione → skład jednej Róży (kolejność według pozycji).
-- SECURITY INVOKER: obowiązuje RLS, więc zwykły użytkownik widzi tylko własne potwierdzenie.
-- Tajemnica liczona przez istniejącą get_mystery_ids_for_users — jedna logika rotacji.
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
    LEFT JOIN public.acknowledgments a ON a.user_id = mb.id AND a.mystery_id = cm.mystery_id
    ORDER BY
        CASE WHEN p_group_id IS NOT NULL THEN mb.rose_pos END NULLS LAST,
        mb.full_name
$function$;

REVOKE EXECUTE ON FUNCTION public.get_members_overview(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_members_overview(bigint) TO authenticated;
