-- Dodanie kolumny login do profili użytkowników
-- Login służy jako alternatywny identyfikator do logowania (zamiast email)
-- Format: imie.nazwisko (lowercase, polskie znaki zamienione na ASCII)

-- 1. Dodanie kolumny
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "login" text;

-- 2. Funkcja generująca login z full_name
CREATE OR REPLACE FUNCTION public.generate_login(p_full_name text)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
    base_login text;
    final_login text;
    counter integer := 2;
BEGIN
    IF p_full_name IS NULL OR trim(p_full_name) = '' THEN
        RETURN NULL;
    END IF;

    -- Lowercase + zamiana polskich znaków na ASCII
    base_login := lower(trim(p_full_name));
    base_login := replace(base_login, 'ą', 'a');
    base_login := replace(base_login, 'ć', 'c');
    base_login := replace(base_login, 'ę', 'e');
    base_login := replace(base_login, 'ł', 'l');
    base_login := replace(base_login, 'ń', 'n');
    base_login := replace(base_login, 'ó', 'o');
    base_login := replace(base_login, 'ś', 's');
    base_login := replace(base_login, 'ź', 'z');
    base_login := replace(base_login, 'ż', 'z');

    -- Spacja → kropka (tylko pierwsza spacja, czyli imie.nazwisko)
    base_login := replace(base_login, ' ', '.');

    -- Usunięcie znaków niedozwolonych (zostaw litery, cyfry, kropki, myślniki)
    base_login := regexp_replace(base_login, '[^a-z0-9.\-]', '', 'g');

    -- Sprawdzenie unikalności
    final_login := base_login;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE login = final_login) LOOP
        final_login := base_login || counter::text;
        counter := counter + 1;
    END LOOP;

    RETURN final_login;
END;
$function$;

-- 3. Wypełnienie loginów dla istniejących użytkowników
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id, full_name FROM public.profiles WHERE login IS NULL AND full_name IS NOT NULL
    LOOP
        UPDATE public.profiles
        SET login = public.generate_login(r.full_name)
        WHERE id = r.id;
    END LOOP;
END $$;

-- 3b. Nadanie loginu 'admin' głównemu administratorowi
UPDATE public.profiles
SET login = 'admin'
WHERE role = 'admin'
  AND id = (SELECT id FROM public.profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1);

-- 4. Unikalny indeks na login
CREATE UNIQUE INDEX IF NOT EXISTS profiles_login_key ON public.profiles USING btree (login);
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_login_key" UNIQUE USING INDEX "profiles_login_key";

-- 5. Trigger - automatyczne generowanie loginu przy INSERT
CREATE OR REPLACE FUNCTION public.set_login_on_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.login IS NULL AND NEW.full_name IS NOT NULL THEN
        NEW.login := public.generate_login(NEW.full_name);
    END IF;
    RETURN NEW;
END;
$function$;

CREATE TRIGGER trigger_set_login_on_insert
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_login_on_insert();

-- 6. Polityka RLS - anonimowi użytkownicy mogą czytać login (potrzebne do logowania)
CREATE POLICY "Allow anon to read login for auth"
    ON "public"."profiles"
    AS permissive
    FOR SELECT
    TO anon
    USING (true);
