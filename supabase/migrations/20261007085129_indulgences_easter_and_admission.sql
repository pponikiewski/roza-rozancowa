-- Odpusty: Wielkanoc (święto ruchome) i dzień przyjęcia Róży do Stowarzyszenia Żywego Różańca
-- 1. indulgence_days.is_easter — data liczona co roku (month/day puste)
-- 2. groups.admission_month/admission_day — dzień przyjęcia, osobny dla każdej Róży
-- 3. Lista startowa dni odpustów

-- 1. Wielkanoc
ALTER TABLE public.indulgence_days ADD COLUMN IF NOT EXISTS is_easter boolean NOT NULL DEFAULT false;
ALTER TABLE public.indulgence_days ALTER COLUMN month DROP NOT NULL;
ALTER TABLE public.indulgence_days ALTER COLUMN day DROP NOT NULL;
ALTER TABLE public.indulgence_days ADD CONSTRAINT indulgence_days_date_check CHECK (
    (is_easter AND month IS NULL AND day IS NULL AND year IS NULL)
    OR (NOT is_easter AND month IS NOT NULL AND day IS NOT NULL)
);

-- 2. Dzień przyjęcia Róży (co roku, bez roku)
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS admission_month smallint CHECK (admission_month BETWEEN 1 AND 12);
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS admission_day smallint CHECK (admission_day BETWEEN 1 AND 31);
ALTER TABLE public.groups ADD CONSTRAINT groups_admission_check CHECK (
    (admission_month IS NULL) = (admission_day IS NULL)
);

-- 3. Lista startowa (dzień przyjęcia ustawiany osobno dla każdej Róży w panelu admina)
INSERT INTO public.indulgence_days (name, description, month, day, is_easter)
SELECT v.name, d.description, v.month, v.day, v.is_easter
FROM (VALUES
    ('Narodzenie Pańskie', 12::smallint, 25::smallint, false),
    ('Ofiarowanie Pańskie (Matki Bożej Gromnicznej)', 2::smallint, 2::smallint, false),
    ('Zmartwychwstanie Pańskie (Wielkanoc)', NULL, NULL, true),
    ('Zwiastowanie Pańskie', 3::smallint, 25::smallint, false),
    ('Wniebowzięcie Najświętszej Maryi Panny', 8::smallint, 15::smallint, false),
    ('Najświętszej Maryi Panny Różańcowej', 10::smallint, 7::smallint, false),
    ('Niepokalane Poczęcie Najświętszej Maryi Panny', 12::smallint, 8::smallint, false)
) AS v(name, month, day, is_easter)
CROSS JOIN (SELECT 'Zwykłe warunki odpustu zupełnego: spowiedź sakramentalna, Komunia święta, modlitwa w intencjach Ojca Świętego oraz wolność od przywiązania do jakiegokolwiek grzechu, nawet powszedniego.' AS description) d
WHERE NOT EXISTS (SELECT 1 FROM public.indulgence_days i WHERE i.name = v.name);
