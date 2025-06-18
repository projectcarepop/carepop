BEGIN;

-- This policy allows authenticated users to read their own entry in the user_roles table.
-- This is a critical fix because the is_admin() function needs this permission
-- to determine if a user has the 'admin' role. Without this, is_admin() fails,
-- causing all other admin-level RLS policies to deny access.
CREATE POLICY "Allow users to read their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

COMMIT; 