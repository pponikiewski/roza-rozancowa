-- Batch function to get mystery IDs for multiple users at once
-- This eliminates N+1 query problem when loading members list

CREATE OR REPLACE FUNCTION public.get_mystery_ids_for_users(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, mystery_id integer)
LANGUAGE plpgsql
AS $function$
DECLARE
    start_date date := '2024-01-01'; -- Data startu rotacji (musi być taka sama jak w get_mystery_id_for_user)
    months_passed integer;
BEGIN
    -- Oblicz ile miesięcy minęło od startu
    SELECT EXTRACT(YEAR FROM age(now(), start_date)) * 12 +
           EXTRACT(MONTH FROM age(now(), start_date)) INTO months_passed;

    -- Zwróć mystery_id dla wszystkich użytkowników w jednym zapytaniu
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_mystery_ids_for_users(uuid[]) TO anon;
GRANT EXECUTE ON FUNCTION public.get_mystery_ids_for_users(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_mystery_ids_for_users(uuid[]) TO service_role;
