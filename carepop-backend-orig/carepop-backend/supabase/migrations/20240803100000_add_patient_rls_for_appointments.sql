-- Enable RLS on the appointments table if not already enabled
-- ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can select their own appointments
CREATE POLICY patient_select_own_appointments
ON public.appointments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Note: 
-- 1. Ensure RLS is enabled on the public.appointments table.
--    (Uncomment the ALTER TABLE line above if needed, typically done once).
-- 2. Ensure the authenticated role has USAGE grant on the public schema.
--    (GRANT USAGE ON SCHEMA public TO authenticated; -- if needed) 