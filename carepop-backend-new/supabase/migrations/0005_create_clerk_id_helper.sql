-- 0005_create_clerk_id_helper.sql

-- This helper function checks if a user is an admin by inspecting their
-- custom claims from the Clerk JWT. The role is expected to be in the
-- `public_metadata` of the token.

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_metadata JSONB;
    v_role TEXT;
BEGIN
    -- Get the public_metadata from the authenticated user's claims.
    -- The `p_user_id` parameter is passed from RLS policies using `auth.uid()::text`.
    SELECT auth.jwt() -> 'public_metadata' INTO v_metadata;

    -- Extract the role from the metadata.
    v_role := v_metadata ->> 'role';

    -- Return true if the role is 'admin', otherwise false.
    RETURN v_role = 'admin';
EXCEPTION
    -- If any error occurs (e.g., metadata or role is null), return false for safety.
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$; 