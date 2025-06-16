DROP FUNCTION IF EXISTS search_appointments(text,uuid);
DROP FUNCTION IF EXISTS search_appointments(text,uuid,uuid,text,timestamptz,timestamptz);
-- Drop a few other potential signatures to be safe
DROP FUNCTION IF EXISTS public.search_appointments(search_term text, p_clinic_id uuid);
DROP FUNCTION IF EXISTS public.search_appointments(search_term text, p_clinic_id uuid, p_provider_id uuid, p_status text, p_start_date timestamptz, p_end_date timestamptz);

CREATE OR REPLACE FUNCTION search_appointments(
    search_term TEXT DEFAULT NULL,
    p_clinic_id UUID DEFAULT NULL,
    p_provider_id UUID DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    service_id UUID,
    clinic_id UUID,
    provider_id UUID,
    appointment_datetime TIMESTAMPTZ,
    duration_minutes INTEGER,
    status public.appointment_status_enum,
    notes_user TEXT,
    notes_clinic TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    user_first_name TEXT,
    user_last_name TEXT,
    user_email TEXT,
    service_name TEXT,
    service_cost NUMERIC,
    clinic_name TEXT,
    provider_full_name TEXT,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.user_id,
        a.service_id,
        a.clinic_id,
        a.provider_id,
        a.appointment_datetime,
        a.duration_minutes,
        a.status,
        a.notes_user,
        a.notes_clinic,
        a.created_at,
        a.updated_at,
        uv.first_name AS user_first_name,
        uv.last_name AS user_last_name,
        uv.email AS user_email,
        s.name AS service_name,
        s.cost AS service_cost,
        c.name AS clinic_name,
        (pv.first_name || ' ' || pv.last_name) AS provider_full_name,
        COUNT(*) OVER() as total_count
    FROM
        public.appointments a
    LEFT JOIN
        public.users_view uv ON a.user_id = uv.id
    LEFT JOIN
        public.services s ON a.service_id = s.id
    LEFT JOIN
        public.clinics c ON a.clinic_id = c.id
    LEFT JOIN
        public.providers p ON a.provider_id = p.id
    LEFT JOIN
        public.users_view pv ON p.user_id = pv.id
    WHERE
        (p_clinic_id IS NULL OR a.clinic_id = p_clinic_id) AND
        (p_provider_id IS NULL OR a.provider_id = p_provider_id) AND
        (p_status IS NULL OR a.status::text = p_status) AND
        (p_start_date IS NULL OR a.appointment_datetime >= p_start_date) AND
        (p_end_date IS NULL OR a.appointment_datetime <= p_end_date) AND
        (
            search_term IS NULL OR
            search_term = '' OR
            (uv.first_name || ' ' || uv.last_name) ILIKE '%' || search_term || '%' OR
            uv.email ILIKE '%' || search_term || '%' OR
            s.name ILIKE '%' || search_term || '%' OR
            c.name ILIKE '%' || search_term || '%' OR
            (pv.first_name || ' ' || pv.last_name) ILIKE '%' || search_term || '%'
        );
END;
$$ LANGUAGE plpgsql; 