-- Drop the old function and type if they exist, to ensure a clean slate.
-- This is necessary because we are changing the function's return signature.
DROP FUNCTION IF EXISTS public.get_user_data(user_id_param UUID);
DROP TYPE IF EXISTS public.full_user_data;

-- Create a custom type to define the shape of the user data we want to return.
-- This includes profile information and an array of roles.
CREATE TYPE public.full_user_data AS (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    roles TEXT[]
);

-- Create the RPC function 'get_user_data'
-- This function takes a user ID and returns the corresponding profile and roles.
-- This version uses a subquery for roles, which is more robust than a LEFT JOIN,
-- especially for users who may not have a role assigned yet.
CREATE OR REPLACE FUNCTION public.get_user_data(user_id_param UUID)
RETURNS public.full_user_data
LANGUAGE plpgsql
SECURITY DEFINER -- Important for accessing user_roles table
SET search_path = public
AS $$
DECLARE
    result public.full_user_data;
BEGIN
    SELECT
        p.user_id,
        p.first_name,
        p.last_name,
        p.email,
        -- Use a subquery with COALESCE to ensure we get an empty array '{}' instead of NULL if no roles exist.
        (SELECT COALESCE(array_agg(ur.role), '{}') FROM user_roles ur WHERE ur.user_id = p.user_id)
    INTO result
    FROM
        profiles p
    WHERE
        p.user_id = user_id_param;
        
    RETURN result;
END;
$$;

-- Grant execute permissions on the new function to the necessary roles.
GRANT EXECUTE ON FUNCTION public.get_user_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_data(UUID) TO service_role; 