-- Dodanie kolumny login do profili użytkowników
-- Login służy jako alternatywny identyfikator do logowania (zamiast email)

ALTER TABLE "public"."profiles" ADD COLUMN "login" text;

-- Unikalny indeks na login (każdy użytkownik musi mieć unikalny login)
CREATE UNIQUE INDEX profiles_login_key ON public.profiles USING btree (login);

ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_login_key" UNIQUE USING INDEX "profiles_login_key";
