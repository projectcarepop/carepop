-- Define the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Drop the trigger if it already exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to call handle_new_user on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a new profile entry (user_id only) when a user signs up via Supabase Auth.';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'When a new user is created in auth.users, automatically create a corresponding profile stub (user_id only) in public.profiles.'; 