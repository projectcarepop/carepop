-- Function to get the role of the currently authenticated user
-- This version temporarily bypasses RLS to avoid infinite recursion when called from within an RLS policy.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
-- Set a high cost to discourage the planner from inlining the function
COST 1000
AS $$
DECLARE
  my_role TEXT;
BEGIN
  -- Temporarily bypass RLS.
  -- This is safe because we are in a SECURITY DEFINER function and are only fetching the role
  -- for the currently authenticated user (auth.uid()).
  SET astra.rls_bypass = 'on';

  SELECT role INTO my_role
  FROM public.user_roles 
  WHERE user_id = auth.uid();

  -- IMPORTANT: Always reset the bypass setting
  SET astra.rls_bypass = 'off';
  
  RETURN my_role;
END;
$$; 