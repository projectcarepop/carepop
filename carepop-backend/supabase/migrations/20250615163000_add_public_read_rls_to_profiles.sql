-- This policy allows public, anonymous read access to all profiles.
-- This is necessary for the public profile fetching endpoint to work.
-- If more granular control is needed in the future, this policy can be
-- restricted to only expose certain columns (e.g., name, avatar) instead of the whole row.
CREATE POLICY "Allow public read access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (true); 