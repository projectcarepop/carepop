-- Grant execute permission on the function to the 'authenticated' role,
-- which is used by logged-in users.
GRANT EXECUTE
ON FUNCTION public.get_users_with_roles(role_filter TEXT, search_term TEXT)
TO authenticated;

-- Grant execute permission on the function to the 'service_role',
-- which is used for elevated backend operations.
GRANT EXECUTE
ON FUNCTION public.get_users_with_roles(role_filter TEXT, search_term TEXT)
TO service_role; 