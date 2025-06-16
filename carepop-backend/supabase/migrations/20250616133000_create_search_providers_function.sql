CREATE OR REPLACE FUNCTION search_providers(
    search_term TEXT DEFAULT NULL,
    p_clinic_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    license_number TEXT,
    specialty TEXT,
    is_active BOOLEAN,
    accepting_new_patients BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    email TEXT,
    contact_number TEXT,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.user_id,
        p.license_number,
        p.specialty,
        p.is_active,
        p.accepting_new_patients,
        p.created_at,
        p.updated_at,
        uv.first_name,
        uv.last_name,
        uv.full_name,
        uv.email,
        uv.contact_number,
        uv.avatar_url
    FROM
        public.providers p
    JOIN
        public.users_view uv ON p.user_id = uv.id
    WHERE
        search_term IS NULL OR
        search_term = '' OR
        uv.full_name ILIKE '%' || search_term || '%' OR
        uv.email ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql; 