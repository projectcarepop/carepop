-- Creates a trigger function that inserts a new row into public.profiles
-- for each new user in auth.users.
-- This ensures that a user profile is always present for a valid user.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insert a new profile, linking it to the new user via their ID and pre-filling the email.
  insert into public.profiles (user_id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Create the trigger to activate the function after a new user is inserted into auth.users.
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 