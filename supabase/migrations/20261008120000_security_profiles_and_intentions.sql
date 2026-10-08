-- Bezpieczeństwo: zapis intencji i profili tylko dla admina, profile niewidoczne bez logowania
-- 1. intentions — dotąd każdy zalogowany mógł dodać, zmienić i usunąć intencję
-- 2. profiles (edycja) — dotąd użytkownik mógł zmienić własny profil, w tym role = 'admin'.
--    Aplikacja nie ma edycji profilu przez użytkownika: login i pozycję zmienia admin,
--    konta tworzą funkcje serwerowe (service_role).
-- 3. profiles (odczyt) — dotąd bez logowania dało się pobrać imiona, nazwiska i loginy wszystkich.
--    Logowanie nie czyta profiles (login zamieniany jest na e-mail po stronie aplikacji).

-- 1. intentions: odczyt dla wszystkich ("Anyone can read intentions"), zapis tylko admin
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.intentions;
DROP POLICY IF EXISTS "Admin can manage intentions" ON public.intentions;

CREATE POLICY "Admin inserts intentions"
    ON public.intentions
    FOR INSERT
    WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admin updates intentions"
    ON public.intentions
    FOR UPDATE
    USING ((SELECT public.is_admin()))
    WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admin deletes intentions"
    ON public.intentions
    FOR DELETE
    USING ((SELECT public.is_admin()));

-- 2. profiles: edycja tylko admin
DROP POLICY IF EXISTS "Profile Update" ON public.profiles;

CREATE POLICY "Admin updates profiles"
    ON public.profiles
    FOR UPDATE
    USING ((SELECT public.is_admin()))
    WITH CHECK ((SELECT public.is_admin()));

-- 3. profiles: odczyt tylko po zalogowaniu
DROP POLICY IF EXISTS "Każdy widzi profile" ON public.profiles;

CREATE POLICY "Logged-in users read profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);
