CREATE OR REPLACE FUNCTION public.handle_new_user_and_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile for the new user
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);

  -- Assign the 'patient' role to the new user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 