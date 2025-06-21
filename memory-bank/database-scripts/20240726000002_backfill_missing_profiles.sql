-- This is a one-time backfill script to create profiles for existing users
-- in auth.users who do not have a corresponding entry in public.profiles.
-- This script should be run once directly in the Supabase SQL Editor.

insert into public.profiles (user_id, email)
select
    u.id,
    u.email
from
    auth.users as u
left join
    public.profiles as p on u.id = p.user_id
where
    p.user_id is null; 