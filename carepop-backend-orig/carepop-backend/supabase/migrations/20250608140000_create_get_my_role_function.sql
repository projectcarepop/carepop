-- Function to get the role of the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.user_roles 
    WHERE user_id = auth.uid()
  );
END;
$$; 