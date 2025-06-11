-- Create a custom type for the return value to ensure type safety
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_with_role') THEN
        CREATE TYPE user_with_role AS (
            user_id UUID,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            created_at TIMESTAMPTZ,
            role TEXT
        );
    END IF;
END$$;

-- Create the function to get users with their roles, with optional filtering
CREATE OR REPLACE FUNCTION get_users_with_roles(
    search_term TEXT DEFAULT NULL,
    role_filter TEXT DEFAULT NULL
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
    LEFT JOIN -- Use LEFT JOIN to include users who might not have a role assigned yet
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