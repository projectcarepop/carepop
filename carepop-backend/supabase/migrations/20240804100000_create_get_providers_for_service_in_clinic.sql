-- Function to get providers for a specific service within a specific clinic.
-- This is crucial for the booking flow where a user has selected a clinic and a service
-- and needs to see which providers are available.

CREATE OR REPLACE FUNCTION get_providers_for_service_in_clinic(
    p_clinic_id UUID,
    p_service_id UUID
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    specialty TEXT,
    photo_url TEXT,
    is_accepting_new_patients BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.full_name,
        p.specialty,
        p.photo_url,
        p.is_accepting_new_patients
    FROM
        providers p
    -- Join to find providers associated with the given clinic
    JOIN clinic_providers cp ON p.id = cp.provider_id
    -- Join to find providers who offer the given service
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE
        cp.clinic_id = p_clinic_id
        AND ps.service_id = p_service_id
        AND p.is_active = TRUE
        AND cp.is_active = TRUE; -- Ensure the association between clinic and provider is active
END;
$$ LANGUAGE plpgsql;

-- Grant usage to authenticated users, as this is for the public-facing booking flow
GRANT EXECUTE ON FUNCTION get_providers_for_service_in_clinic(UUID, UUID) TO authenticated; 