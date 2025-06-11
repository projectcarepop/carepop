-- Drop the old function with the incorrect parameter order.
-- We must specify the types to ensure we drop the correct function overload.
DROP FUNCTION IF EXISTS get_users_with_roles(search_term TEXT, role_filter TEXT);

-- Recreate the function with the parameters in alphabetical order to match what the
-- Supabase RPC client expects.
CREATE OR REPLACE FUNCTION get_users_with_roles(
    role_filter TEXT DEFAULT NULL,
    search_term TEXT DEFAULT NULL
)
RETURNS SETOF user_with_role AS $$
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