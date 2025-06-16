-- Drop the faulty recursive policy
DROP POLICY "Allow admin full access" ON public.user_roles;

-- Create a new policy using the non-recursive helper function
CREATE POLICY "Allow admin full access" 
ON public.user_roles 
FOR ALL 
USING ( (public.get_my_role() = 'admin'::text) ) 
WITH CHECK ( (public.get_my_role() = 'admin'::text) ); 