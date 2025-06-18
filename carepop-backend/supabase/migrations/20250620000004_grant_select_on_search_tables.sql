-- Grant permissions for the search_appointments function
GRANT SELECT ON public.appointments TO service_role;
GRANT SELECT ON public.users_view TO service_role;
GRANT SELECT ON public.services TO service_role;
GRANT SELECT ON public.clinics TO service_role;
GRANT SELECT ON public.providers TO service_role;

-- Grant permissions for the search_medical_records function
GRANT SELECT ON public.medical_records TO service_role; 