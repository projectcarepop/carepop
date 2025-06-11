-- Policy: Admins can update the status (and other fields) of any appointment
CREATE POLICY admin_can_update_appointment_status 
ON public.appointments
FOR UPDATE
TO authenticated -- The USING and WITH CHECK clauses will filter for users with the 'admin' role
USING ( -- This determines which rows can be updated
  EXISTS (
    SELECT 1
    FROM public.user_roles ur_table
    WHERE ur_table.user_id = auth.uid()
      AND ur_table.role = 'admin'
  )
)
WITH CHECK ( -- This ensures the new/updated row still conforms to the policy
  EXISTS (
    SELECT 1
    FROM public.user_roles ur_table
    WHERE ur_table.user_id = auth.uid()
      AND ur_table.role = 'admin'
  )
);

-- Note:
-- 1. Assumes RLS is already enabled on the public.appointments table.
-- 2. Assumes the authenticated role has USAGE grant on the public schema.
-- 3. Assumes existence of public.user_roles table (with user_id, role).
-- 4. This policy allows admins to update any field on any appointment. 
--    If column-specific update permissions are needed, they must be handled at the application/API layer. 