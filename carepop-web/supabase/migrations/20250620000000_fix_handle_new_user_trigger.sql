-- Description: Fixes the handle_new_user trigger to correctly insert a new user's profile.
-- The previous version had a mismatch between the public.users table and the auth.users table,
-- causing login and registration to fail silently. This version ensures that when a new user
-- is created in auth.users, a corresponding record with the correct user ID and email
-- is inserted into the public.profiles table.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insert a new profile for the new user
  insert into public.profiles (id)
  values (new.id);
  
  -- Assign the default 'user' role to the new user
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$$;

-- Drop the old trigger if it exists, to prevent errors
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger to run the new function after a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 