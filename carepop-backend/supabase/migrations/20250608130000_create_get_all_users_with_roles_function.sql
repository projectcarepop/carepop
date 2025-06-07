CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE(
    user_id uuid,
    first_name text,
    last_name text,
    created_at timestamptz,
    role text,
    email text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        p.user_id,
        p.first_name,
        p.last_name,
        p.created_at,
        ur.role,
        au.email
    FROM
        public.profiles p
    LEFT JOIN
        public.user_roles ur ON p.user_id = ur.user_id
    LEFT JOIN
        auth.users au ON p.user_id = au.id;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_users_with_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users_with_roles() TO service_role; 