CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    is_admin_user BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    ) INTO is_admin_user;
    RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 