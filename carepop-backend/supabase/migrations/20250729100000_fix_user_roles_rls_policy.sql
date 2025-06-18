BEGIN;

-- POLICIES FOR: public.user_roles
-- 1. Base policy: Allow users to read their own role entry.
-- This is non-recursive and allows helper functions like is_admin() to work,
-- as they can check the role of the currently authenticated user.
CREATE POLICY "Allow users to read their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Admin policy: Allow users with the 'admin' role to see all user roles.
-- This depends on the base policy above to function without recursion.
-- It checks if the current user has an 'admin' role entry for themselves,
-- and if so, grants them access to the entire table.
CREATE POLICY "Allow admins to read all user roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

COMMIT; 