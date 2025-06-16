CREATE OR REPLACE VIEW public.users_view AS
SELECT
    u.id,
    u.email,
    p.first_name,
    p.last_name,
    u.created_at,
    u.last_sign_in_at,
    (
        SELECT array_agg(ur.role)
        FROM public.user_roles ur
        WHERE ur.user_id = u.id
    ) as roles
FROM
    auth.users u
LEFT JOIN
    public.profiles p ON u.id = p.user_id; 