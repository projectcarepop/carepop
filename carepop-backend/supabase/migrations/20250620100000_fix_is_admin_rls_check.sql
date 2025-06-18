-- Correct the is_admin function to not use SECURITY DEFINER
-- This fixes the issue where auth.uid() was returning NULL inside the function.

BEGIN;

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
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
$$ LANGUAGE plpgsql STABLE; -- Keep STABLE, as it's still just querying the DB

COMMIT; 