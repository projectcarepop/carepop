-- Step 1: Drop the old function definitions to ensure a clean slate.
-- We specify both possible signatures to guarantee they are removed.
DROP FUNCTION IF EXISTS public.get_users_with_roles(search_term TEXT, role_filter TEXT);
DROP FUNCTION IF EXISTS public.get_users_with_roles(role_filter TEXT, search_term TEXT);

-- Step 2: Drop the custom type if it exists, so it can be recreated.
DROP TYPE IF EXISTS public.user_with_role;

-- Step 3: Recreate the custom type for the function's return value.
CREATE TYPE public.user_with_role AS (
    user_id UUID,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ,
    role TEXT
);

-- Step 4: Recreate the function with the parameters in the correct alphabetical order.
CREATE OR REPLACE FUNCTION public.get_users_with_roles(
    role_filter TEXT DEFAULT NULL,
    search_term TEXT DEFAULT NULL
)
RETURNS SETOF public.user_with_role AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.user_id,
        p.first_name,
        p.last_name,
        p.email,
        p.created_at,
        ur.role
    FROM
        public.profiles p
    LEFT JOIN
        public.user_roles ur ON p.user_id = ur.user_id
    WHERE
        (search_term IS NULL OR (
            p.first_name ILIKE '%' || search_term || '%' OR
            p.last_name ILIKE '%' || search_term || '%' OR
            p.email ILIKE '%' || search_term || '%'
        )) AND
        (role_filter IS NULL OR ur.role = role_filter);
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 5: Grant execute permissions to the necessary roles.
GRANT EXECUTE
ON FUNCTION public.get_users_with_roles(role_filter TEXT, search_term TEXT)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.get_users_with_roles(role_filter TEXT, search_term TEXT)
TO service_role; 