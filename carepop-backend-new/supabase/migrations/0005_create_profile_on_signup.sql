-- Creates a trigger function that fires on new user sign-up and creates a corresponding profile.
-- 1. Defines the function public.handle_new_user to insert a new profile.
-- 2. Defines the trigger on_auth_user_created to call the function after a new user is inserted into auth.users.

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new row into public.profiles
  -- id is taken from the new user's id in auth.users
  -- email is taken from the new user's email
  -- role is defaulted to 'patient'
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'patient');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to execute the function after a new user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user(); 