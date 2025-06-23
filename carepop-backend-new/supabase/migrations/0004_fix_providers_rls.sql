-- Grant basic SELECT access to all authenticated users for providers and profiles
GRANT SELECT ON public.providers TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;

-- Grant full access to the service role for backend operations
GRANT ALL ON public.providers TO service_role;
GRANT ALL ON public.profiles TO service_role;

-- Enable Row Level Security for both tables
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to see all providers.
-- In a real-world scenario, you might restrict this further.
CREATE POLICY "Allow authenticated users to see all providers"
ON public.providers
FOR SELECT
TO authenticated
USING (true);

-- Create a policy that allows users to see their own profile, and admins to see all profiles.
CREATE POLICY "Allow users to see own profile, and admins to see all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (clerk_id = public.current_user_clerk_id()) OR (public.is_admin(auth.uid()))
); 