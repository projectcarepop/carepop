-- Migration: 0007_consolidate_auth_and_rls.sql
-- This migration consolidates several historical migrations into a single,
-- definitive script to establish the correct RLS and user management scheme based on Clerk.
-- It is designed to be run on a database that may be in an inconsistent state.

-- ========= PRE-CLEANUP: Drop old objects if they exist to ensure idempotency =========

-- Drop the user_roles table completely to ensure it's created fresh.
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop the old functions and ALL dependent objects (like RLS policies) using CASCADE.
-- This is the most robust way to clear the slate before recreating the objects correctly.
DROP FUNCTION IF EXISTS public.is_admin(text) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.current_user_clerk_id() CASCADE;


-- ========= STEP 1: Define User Role Enum and Table =========

-- Create app_role type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'provider');
    END IF;
END$$;

-- Create user_roles table. It will be created fresh after the DROP command above.
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_clerk_id TEXT NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_clerk_id, role)
);

COMMENT ON TABLE public.user_roles IS 'Assigns roles (admin, user, provider) to users based on their Clerk ID.';

-- ========= STEP 2: Create Helper Functions =========

-- Function to get the current user's Clerk ID from the JWT claims.
CREATE OR REPLACE FUNCTION public.current_user_clerk_id()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
    (SELECT current_setting('request.jwt.claim.sub', true))
  );
$$;
COMMENT ON FUNCTION public.current_user_clerk_id() IS 'Retrieves the Clerk User ID (sub) from the JWT claims.';

-- Function to check if a given user (by Clerk ID) is an admin.
CREATE OR REPLACE FUNCTION public.is_admin(p_user_clerk_id TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_clerk_id = p_user_clerk_id AND ur.role = 'admin'
  );
END;
$$;
COMMENT ON FUNCTION public.is_admin(text) IS 'Checks if a user is an admin based on their Clerk ID by looking in the user_roles table.';

GRANT EXECUTE ON FUNCTION public.current_user_clerk_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(text) TO authenticated, service_role;


-- ========= STEP 3: Enable RLS and Create Policies =========

-- -- PROVIDERS Table --
-- Ensure RLS is enabled before creating policies
DO $$BEGIN ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN DUPLICATE_OBJECT THEN RAISE NOTICE 'RLS is already enabled on providers'; END;$$;

-- Drop policy if it exists before creating it
DROP POLICY IF EXISTS "Allow authenticated users to see all providers" ON public.providers;
CREATE POLICY "Allow authenticated users to see all providers"
ON public.providers FOR SELECT TO authenticated USING (true);


-- -- PROFILES Table --
DO $$BEGIN ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN DUPLICATE_OBJECT THEN RAISE NOTICE 'RLS is already enabled on profiles'; END;$$;

DROP POLICY IF EXISTS "Allow users to see own profile, and admins to see all" ON public.profiles;
CREATE POLICY "Allow users to see own profile, and admins to see all"
ON public.profiles FOR SELECT TO authenticated
USING (
  (clerk_id = public.current_user_clerk_id()) OR (public.is_admin(public.current_user_clerk_id()))
);


-- -- USER_ROLES Table --
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_clerk_id = public.current_user_clerk_id());

DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.is_admin(public.current_user_clerk_id()))
WITH CHECK (public.is_admin(public.current_user_clerk_id()));


-- ========= STEP 4: Seed the Admin User =========
-- This is the crucial step to ensure the provided user has admin rights.
-- The ON CONFLICT clause prevents errors if the script is run multiple times.
INSERT INTO public.user_roles (user_clerk_id, role)
VALUES ('user_2ypr7zz7h5m2jzEPlA9f0t48Fyo', 'admin')
ON CONFLICT (user_clerk_id, role) DO NOTHING; 