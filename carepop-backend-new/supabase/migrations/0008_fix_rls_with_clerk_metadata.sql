-- Migration: 0008_fix_rls_with_clerk_metadata.sql
-- This migration fixes RLS by checking for the admin role directly in the Clerk JWT metadata,
-- which is the true source of truth for user roles in this application.

-- ========= PRE-CLEANUP: Drop all old and incorrect objects =========

-- Drop the user_roles table as it's an unused artifact.
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop the old functions and ALL dependent objects (like RLS policies) using CASCADE.
DROP FUNCTION IF EXISTS public.is_admin(text) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.current_user_clerk_id() CASCADE;

-- ========= STEP 1: Create the new JWT-based helper functions =========

-- This function checks for admin status directly in the JWT claims passed by Clerk.
-- It assumes the role is stored in public_metadata with the key 'role' and value 'admin'.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT (
    current_setting('request.jwt.claims', true)::jsonb
    -> 'public_metadata' ->> 'role'
  ) = 'admin'
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION public.is_admin() IS 'Checks if the current user is an admin by inspecting the public_metadata.role claim in the Clerk JWT.';

-- This function gets the current user's Clerk ID (the 'sub' claim) from the JWT.
CREATE OR REPLACE FUNCTION public.current_user_clerk_id()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'sub'
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_clerk_id() TO authenticated, service_role;

-- ========= STEP 2: Recreate RLS Policies using the new functions =========

-- Since CASCADE dropped old policies, we recreate the essential ones.
-- We also add explicit DROP POLICY statements to ensure idempotency.

-- -- PROFILES Table --
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile, admins can view all" ON public.profiles;
CREATE POLICY "Users can view their own profile, admins can view all"
ON public.profiles FOR SELECT TO authenticated
USING (
  (clerk_id = public.current_user_clerk_id()) OR (public.is_admin())
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (clerk_id = public.current_user_clerk_id());


-- -- PROVIDERS Table --
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to providers" ON public.providers;
CREATE POLICY "Admins have full access to providers"
ON public.providers FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view provider info" ON public.providers;
CREATE POLICY "Public can view provider info"
ON public.providers FOR SELECT TO authenticated
USING (true); 