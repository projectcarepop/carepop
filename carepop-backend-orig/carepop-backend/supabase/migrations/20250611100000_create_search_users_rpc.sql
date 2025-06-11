CREATE OR REPLACE FUNCTION search_users(
    search_term TEXT,
    role_filter TEXT,
    page_num INT,
    page_size INT
)
RETURNS TABLE(
    user_id UUID,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    role TEXT,
    created_at TIMESTAMPTZ,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_users AS (
        SELECT
            u.id AS user_id,
            p.first_name,
            p.last_name,
            u.email,
            ur.role,
            u.created_at
        FROM
            auth.users u
        LEFT JOIN
            profiles p ON u.id = p.user_id
        LEFT JOIN
            user_roles ur ON u.id = ur.user_id
        WHERE
            (
                search_term IS NULL OR search_term = '' OR
                p.first_name ILIKE '%' || search_term || '%' OR
                p.last_name ILIKE '%' || search_term || '%' OR
                u.email ILIKE '%' || search_term || '%'
            )
            AND
            (
                role_filter IS NULL OR role_filter = '' OR ur.role = role_filter
            )
    ),
    counted AS (
        SELECT *, COUNT(*) OVER() as total_count FROM filtered_users
    )
    SELECT
        c.user_id,
        c.first_name,
        c.last_name,
        c.email,
        c.role,
        c.created_at,
        c.total_count
    FROM
        counted c
    ORDER BY
        c.created_at DESC
    LIMIT
        page_size
    OFFSET
        (page_num - 1) * page_size;
END;
$$ LANGUAGE plpgsql; 