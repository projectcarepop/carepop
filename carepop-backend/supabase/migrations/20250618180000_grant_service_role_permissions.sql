-- Grant necessary permissions to the service_role for tables used in admin searches.
-- This ensures the backend services have the required access to prevent 500 errors.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.appointments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.services TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.clinics TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.providers TO service_role; 