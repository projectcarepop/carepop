BEGIN;

-- This migration removes a faulty and recursive RLS policy from the user_roles table.
-- The "Allow admin full access" policy was checking the user_roles table to
-- determine if a user could access the user_roles table, creating an infinite loop
-- that caused all admin checks to fail. Removing it is critical for the
-- is_admin() function and all dependent RLS policies to work correctly.
DROP POLICY IF EXISTS "Allow admin full access" ON public.user_roles;

COMMIT; 