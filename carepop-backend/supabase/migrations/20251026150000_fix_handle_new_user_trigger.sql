-- Define the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Correctly inserts the auth user's ID into the 'id' column of the profiles table.
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- The trigger itself does not need to be changed, only the function it calls.
-- We re-run the create trigger command to ensure it's pointing to the updated function.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Correctly creates a profile entry by mapping auth.users.id to profiles.id.'; 