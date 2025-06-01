-- Policy: Admins can select all appointments
CREATE POLICY admin_select_all_appointments
ON public.appointments
FOR SELECT
TO authenticated -- The USING clause will effectively filter for users with the 'admin' role
USING (
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