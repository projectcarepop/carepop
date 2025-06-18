BEGIN;

-- This migration fixes a critical security flaw in the is_admin() function.
-- By adding 'SECURITY DEFINER', the function now runs with the permissions
-- of the user who defined it (the database owner), allowing it to correctly
-- read the user_roles table to check a user's role. Previously, it used
-- 'SECURITY INVOKER' (the default), which caused it to fail silently when
-- called by a regular user, effectively locking admins out of all RLS-protected
-- resources that relied on this function.
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin_user BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = check_user_id AND role = 'admin'
    ) INTO is_admin_user;
    RETURN is_admin_user;
END;
$$;

COMMIT; 