-- First, drop the old, incorrect function if it exists.
DROP FUNCTION IF EXISTS get_providers_for_service_in_clinic(uuid, uuid);

-- Then, create the new, correct function.
CREATE OR REPLACE FUNCTION get_providers_for_service_in_clinic(
    p_clinic_id uuid,
    p_service_id uuid
)
RETURNS TABLE (
    id uuid,
    full_name text,
    specialty text,
    avatar_url text,
    is_accepting_new_patients boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.full_name,
        p.specialty,
        p.avatar_url,
        p.is_accepting_new_patients
    FROM
        providers p
    -- Join to find providers associated with the given clinic
    JOIN provider_facilities pf ON p.id = pf.provider_id
    -- Join to find providers who offer the given service
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE
        pf.clinic_id = p_clinic_id
        AND ps.service_id = p_service_id
        AND p.is_active = TRUE
        AND pf.is_active = TRUE; -- Ensure the provider's link to the facility is also active
END;
$$; 