-- Grant all permissions on user_medical_records to the service_role
-- to ensure the backend service can access it without RLS issues.

GRANT ALL
ON TABLE public.user_medical_records
TO service_role; 