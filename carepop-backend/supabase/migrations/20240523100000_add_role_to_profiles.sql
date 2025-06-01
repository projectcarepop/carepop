-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN role TEXT;

-- Add comment for the role column
COMMENT ON COLUMN public.profiles.role IS 'User role for authorization (e.g., admin, provider, user)';

-- Update RLS to allow admins to manage all profiles
CREATE POLICY "Admin users can manage all profiles" ON public.profiles
  USING (
    (SELECT app_metadata->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  ); 