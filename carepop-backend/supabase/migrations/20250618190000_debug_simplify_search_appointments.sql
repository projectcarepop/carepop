-- A simplified, debug version of the search_appointments function
-- to isolate the source of the 500 error.
-- This version only queries the appointments table and has no joins.
CREATE OR REPLACE FUNCTION search_appointments(
    search_term TEXT DEFAULT NULL,
    p_clinic_id UUID DEFAULT NULL,
    p_provider_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
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
    -- Dummy fields to match the original return type signature
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
    RAISE LOG 'Executing simplified search_appointments for user: %', p_user_id;
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
        'test_first'::TEXT,
        'test_last'::TEXT,
        'test@email.com'::TEXT,
        'test_service'::TEXT,
        100::NUMERIC,
        'test_clinic'::TEXT,
        'test_provider'::TEXT,
        (SELECT COUNT(*) FROM public.appointments WHERE public.appointments.user_id = p_user_id)
    FROM
        public.appointments a
    WHERE
        a.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql; 