-- Migration to fix the get_providers_for_service_in_clinic RPC function
-- It was referencing a non-existent table `clinic_providers` instead of `provider_facilities`.

BEGIN;

-- Drop the old, incorrect function if it exists
DROP FUNCTION IF EXISTS public.get_providers_for_service_in_clinic(p_clinic_id uuid, p_service_id uuid);

-- Create the new, corrected function
CREATE OR REPLACE FUNCTION public.get_providers_for_service_in_clinic(p_clinic_id uuid, p_service_id uuid)
RETURNS TABLE(
    provider_id uuid,
    full_name text,
    specialty text,
    photo_url text,
    is_accepting_new_patients boolean,
    schedules json
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as provider_id,
        p.full_name,
        p.specialty,
        p.photo_url,
        p.is_accepting_new_patients,
        (
            SELECT json_agg(s.*)
            FROM public.provider_schedules s
            WHERE s.provider_id = p.id AND s.clinic_id = pf.clinic_id
        ) as schedules
    FROM
        public.providers p
    -- Join to find providers in the specified clinic
    JOIN
        public.provider_facilities pf ON p.id = pf.provider_id
    -- Join to ensure the provider offers the specified service
    JOIN
        public.provider_services ps ON p.id = ps.provider_id
    WHERE
        pf.clinic_id = p_clinic_id
        AND ps.service_id = p_service_id
        AND p.is_active = TRUE;
END;
$$;

COMMIT; 