-- Drop the old, problematic policy
DROP POLICY IF EXISTS "Service role can create profiles." ON public.profiles;

-- Create a new, correct policy that allows the service_role to insert profiles.
-- The service_role is what our backend uses (via supabaseAdmin) to create a
-- user's profile immediately after their auth.user record is created.
CREATE POLICY "Allow service_role to create profiles"
ON public.profiles FOR INSERT TO service_role
WITH CHECK (true); 