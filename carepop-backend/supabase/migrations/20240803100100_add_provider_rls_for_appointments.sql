-- Policy: Providers can select appointments associated with them
CREATE POLICY provider_select_their_appointments
ON public.appointments
FOR SELECT
TO authenticated -- The USING clause will effectively filter for providers
USING (
  EXISTS (
    SELECT 1
    FROM public.providers prov_table
    JOIN public.user_roles ur_table ON prov_table.user_id = ur_table.user_id
    WHERE prov_table.user_id = auth.uid() -- Check if the current authenticated user is a provider
      AND ur_table.role = 'provider'         -- And has the 'provider' role
      AND prov_table.id = appointments.provider_id -- And the appointment's provider_id matches this provider's ID
  )
);

-- Note:
-- 1. Assumes RLS is already enabled on the public.appointments table.
-- 2. Assumes the authenticated role has USAGE grant on the public schema.
-- 3. Assumes existence of public.providers table (with id, user_id) 
--    and public.user_roles table (with user_id, role). 