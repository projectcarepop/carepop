BEGIN;

-- This policy grants admin users full access (SELECT, INSERT, UPDATE, DELETE)
-- to the services table by checking their role via the is_admin() function.
-- This fixes the issue where admins could not update services because the
-- existing policy only granted permissions to the 'service_role'.
CREATE POLICY "Allow admin full access to services"
ON public.services
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

COMMIT; 