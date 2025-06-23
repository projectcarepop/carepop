-- Migration: 0011_rebuild_rls_from_scratch.sql
-- THIS IS A CONSTRUCTIVE, REBUILD-ONLY SCRIPT.
-- It creates the correct RLS policies and functions from a clean slate.

-- ========= STEP 1: Create the new JWT-based helper functions =========

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT (
    current_setting('request.jwt.claims', true)::jsonb
    -> 'public_metadata' ->> 'role'
  ) = 'admin'
$$ LANGUAGE sql STABLE;
COMMENT ON FUNCTION public.is_admin() IS 'Checks if the current user is an admin by inspecting the public_metadata.role claim in the Clerk JWT.';

CREATE OR REPLACE FUNCTION public.current_user_clerk_id()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'sub'
$$;
COMMENT ON FUNCTION public.current_user_clerk_id() IS 'Retrieves the Clerk User ID (sub) from the JWT claims.';

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_clerk_id() TO authenticated, service_role;

-- ========= STEP 2: Recreate RLS Policies using the new functions =========

-- -- PROFILES Table --
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile, admins can view all" ON public.profiles FOR SELECT TO authenticated USING ((clerk_id = public.current_user_clerk_id()) OR (public.is_admin()));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (clerk_id = public.current_user_clerk_id());

-- -- PROVIDERS Table --
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to providers" ON public.providers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public can view provider info" ON public.providers FOR SELECT TO authenticated USING (true); 