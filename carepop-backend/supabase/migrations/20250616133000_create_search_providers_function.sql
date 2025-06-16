DROP FUNCTION IF EXISTS public.search_providers(TEXT, UUID);

CREATE OR REPLACE FUNCTION search_providers(
    search_term TEXT DEFAULT NULL,
    p_clinic_id UUID DEFAULT NULL -- This parameter is not used yet but kept for future use
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    is_active BOOLEAN,
    accepting_new_patients BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    email TEXT,
    contact_number TEXT,
    avatar_url TEXT,
    specialty TEXT,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH provider_base AS (
        SELECT
            p.id,
            p.user_id,
            p.is_active,
            p.accepting_new_patients,
            p.created_at,
            p.updated_at,
            p.first_name,
            p.last_name,
            p.full_name,
            p.email,
            p.contact_number,
            p.avatar_url,
            string_agg(s.name, ', ') AS specialty
        FROM
            public.providers p
        LEFT JOIN public.provider_specialties ps ON p.id = ps.provider_id
        LEFT JOIN public.specialties s ON ps.specialty_id = s.id
        GROUP BY
            p.id
    )
    SELECT *, (SELECT COUNT(*) FROM provider_base) as total_count
    FROM provider_base pb
    WHERE
        (
            search_term IS NULL OR
            search_term = '' OR
            pb.full_name ILIKE '%' || search_term || '%' OR
            pb.first_name ILIKE '%' || search_term || '%' OR
            pb.last_name ILIKE '%' || search_term || '%' OR
            pb.specialty ILIKE '%' || search_term || '%'
        );
END;
$$ LANGUAGE plpgsql; 