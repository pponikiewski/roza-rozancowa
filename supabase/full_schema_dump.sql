


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."generate_login"("p_full_name" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."generate_login"("p_full_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_group_id"() RETURNS bigint
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT group_id FROM profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_group_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_mystery_id_for_user"("p_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_mystery_id_for_user"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_mystery_ids_for_users"("p_user_ids" "uuid"[]) RETURNS TABLE("user_id" "uuid", "mystery_id" integer)
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_mystery_ids_for_users"("p_user_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."move_user_to_group"("p_user_id" "uuid", "p_group_id" bigint) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."move_user_to_group"("p_user_id" "uuid", "p_group_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rotate_group_members"("p_group_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."rotate_group_members"("p_group_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_login_on_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.login IS NULL AND NEW.full_name IS NOT NULL THEN
        NEW.login := public.generate_login(NEW.full_name);
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_login_on_insert"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."acknowledgments" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "mystery_id" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."acknowledgments" OWNER TO "postgres";


ALTER TABLE "public"."acknowledgments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."acknowledgments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


ALTER TABLE "public"."groups" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."groups_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."intentions" (
    "id" bigint NOT NULL,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "title" "text",
    CONSTRAINT "intentions_month_check" CHECK ((("month" >= 1) AND ("month" <= 12)))
);


ALTER TABLE "public"."intentions" OWNER TO "postgres";


ALTER TABLE "public"."intentions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."intentions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."mysteries" (
    "id" integer NOT NULL,
    "part" "text" NOT NULL,
    "name" "text" NOT NULL,
    "meditation" "text",
    "image_url" "text"
);


ALTER TABLE "public"."mysteries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "role" "text" DEFAULT 'user'::"text",
    "group_id" bigint,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "email" "text",
    "rose_pos" integer,
    "login" "text",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'user'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."acknowledgments"
    ADD CONSTRAINT "acknowledgments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."acknowledgments"
    ADD CONSTRAINT "acknowledgments_user_id_mystery_id_key" UNIQUE ("user_id", "mystery_id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."intentions"
    ADD CONSTRAINT "intentions_month_year_key" UNIQUE ("month", "year");



ALTER TABLE ONLY "public"."intentions"
    ADD CONSTRAINT "intentions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mysteries"
    ADD CONSTRAINT "mysteries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_login_key" UNIQUE ("login");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "trigger_set_login_on_insert" BEFORE INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_login_on_insert"();



ALTER TABLE ONLY "public"."acknowledgments"
    ADD CONSTRAINT "acknowledgments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin can manage intentions" ON "public"."intentions" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin full access to groups" ON "public"."groups" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Allow Read All" ON "public"."profiles" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow Service Role Full Access" ON "public"."profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow Update Own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Allow anon to read login for auth" ON "public"."profiles" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anyone can read intentions" ON "public"."intentions" FOR SELECT USING (true);



CREATE POLICY "Enable all access for authenticated users" ON "public"."intentions" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access for service role" ON "public"."profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."intentions" FOR SELECT USING (true);



CREATE POLICY "Insert Policy" ON "public"."acknowledgments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Każdy widzi grupy" ON "public"."groups" FOR SELECT USING (true);



CREATE POLICY "Każdy widzi profile" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Każdy widzi tajemnice" ON "public"."mysteries" FOR SELECT USING (true);



CREATE POLICY "Profile Update" ON "public"."profiles" FOR UPDATE USING ((("auth"."uid"() = "id") OR "public"."is_admin"()));



CREATE POLICY "Read access for authenticated" ON "public"."groups" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "User edytuje siebie" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can delete own" ON "public"."acknowledgments" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own" ON "public"."acknowledgments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users see own, Admin sees all" ON "public"."acknowledgments" FOR SELECT USING ((("auth"."uid"() = "user_id") OR "public"."is_admin"()));



ALTER TABLE "public"."acknowledgments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."intentions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mysteries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."generate_login"("p_full_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_login"("p_full_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_login"("p_full_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_group_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_group_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_group_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_mystery_id_for_user"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_mystery_id_for_user"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_mystery_id_for_user"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_mystery_ids_for_users"("p_user_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_mystery_ids_for_users"("p_user_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_mystery_ids_for_users"("p_user_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."move_user_to_group"("p_user_id" "uuid", "p_group_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."move_user_to_group"("p_user_id" "uuid", "p_group_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."move_user_to_group"("p_user_id" "uuid", "p_group_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."rotate_group_members"("p_group_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."rotate_group_members"("p_group_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."rotate_group_members"("p_group_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_login_on_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_login_on_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_login_on_insert"() TO "service_role";


















GRANT ALL ON TABLE "public"."acknowledgments" TO "anon";
GRANT ALL ON TABLE "public"."acknowledgments" TO "authenticated";
GRANT ALL ON TABLE "public"."acknowledgments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."acknowledgments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."acknowledgments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."acknowledgments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON SEQUENCE "public"."groups_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."groups_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."groups_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."intentions" TO "anon";
GRANT ALL ON TABLE "public"."intentions" TO "authenticated";
GRANT ALL ON TABLE "public"."intentions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."intentions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."intentions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."intentions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."mysteries" TO "anon";
GRANT ALL ON TABLE "public"."mysteries" TO "authenticated";
GRANT ALL ON TABLE "public"."mysteries" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































