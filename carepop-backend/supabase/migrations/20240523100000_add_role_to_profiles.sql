-- Add 'role' column to profiles table
-- ALTER TABLE public.profiles ADD COLUMN role TEXT;

-- Update RLS to allow admins to manage all profiles
CREATE POLICY "Admin users can manage all profiles" ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  ); 