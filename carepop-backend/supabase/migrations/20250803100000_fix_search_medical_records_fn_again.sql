BEGIN;

DROP FUNCTION IF EXISTS public.search_medical_records(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.search_medical_records(p_user_id UUID, p_search_term TEXT)
RETURNS TABLE (
    id UUID,
    record_title TEXT,
    record_details TEXT,
    record_file_url TEXT,
    created_at TIMESTAMPTZ,
    user_id UUID,
    created_by_admin_id UUID,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        umr.id,
        umr.record_title,
        umr.record_details,
        umr.record_file_url,
        umr.created_at,
        umr.user_id,
        umr.created_by_admin_id,
        umr.updated_at
    FROM
        public.user_medical_records AS umr
    WHERE
        umr.user_id = p_user_id
        AND (
            p_search_term IS NULL
            OR p_search_term = ''
            OR umr.record_title ILIKE '%' || p_search_term || '%'
        );
END;
$$;

COMMIT; 