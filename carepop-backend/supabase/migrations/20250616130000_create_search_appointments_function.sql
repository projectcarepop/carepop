CREATE OR REPLACE FUNCTION search_appointments(
    search_term TEXT,
    p_clinic_id UUID DEFAULT NULL,
    p_provider_id UUID DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_date_range_start TIMESTAMPTZ DEFAULT NULL,
    p_date_range_end TIMESTAMPTZ DEFAULT NULL
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
    updated_at TIMESTAMPTZ
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
        a.updated_at
    FROM
        public.appointments a
    LEFT JOIN
        public.users_view uv ON a.user_id = uv.id
    WHERE
        (p_clinic_id IS NULL OR a.clinic_id = p_clinic_id) AND
        (p_provider_id IS NULL OR a.provider_id = p_provider_id) AND
        (p_status IS NULL OR a.status::text = p_status) AND
        (p_date_range_start IS NULL OR a.appointment_datetime >= p_date_range_start) AND
        (p_date_range_end IS NULL OR a.appointment_datetime <= p_date_range_end) AND
        (
            search_term IS NULL OR
            search_term = '' OR
            uv.first_name ILIKE '%' || search_term || '%' OR
            uv.last_name ILIKE '%' || search_term || '%' OR
            uv.email ILIKE '%' || search_term || '%'
        );
END;
$$ LANGUAGE plpgsql; 