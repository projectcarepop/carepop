CREATE OR REPLACE VIEW public.users_view WITH (security_invoker = true) AS
SELECT
    u.id,
    u.email,
    u.phone,
    u.created_at,
    u.last_sign_in_at,
    p.first_name,
    p.last_name,
    (
        SELECT array_agg(ur.role)
        FROM public.user_roles ur
        WHERE ur.user_id = u.id
    ) AS roles
FROM
    auth.users u
LEFT JOIN
    public.profiles p ON u.id = p.user_id;

-- Grant usage to the service_role so it can query the view
GRANT SELECT ON public.users_view TO service_role;
COMMENT ON VIEW public.users_view IS 'Combined view of users with their profile and roles for admin purposes.'; 