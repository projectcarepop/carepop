-- Drop the old, recursive policy
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Allow users to see their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create a new, non-recursive policy for admins
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (is_admin())
WITH CHECK (is_admin()); 