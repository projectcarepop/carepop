-- Migration: 0009_final_rls_cleanup.sql
-- This is a definitive, brute-force cleanup script to resolve all RLS dependency issues.
-- It manually drops all known conflicting policies before rebuilding the auth system.

-- ========= PRE-CLEANUP: Drop all old objects and policies explicitly =========

-- Drop all known admin-related policies explicitly to resolve dependency issues.
-- This is necessary because CASCADE was not reliably removing all dependencies.
DROP POLICY IF EXISTS "Admins can manage all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can manage all availability" ON public.provider_availability;
DROP POLICY IF EXISTS "Admins can manage all provider info" ON public.providers;
DROP POLICY IF EXISTS "Admins can manage all provider specializations" ON public.provider_specializations;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage clinic providers" ON public.clinic_providers;
DROP POLICY IF EXISTS "Admins can manage clinic services" ON public.clinic_services;
DROP POLICY IF EXISTS "Admins can manage clinics" ON public.clinics;
DROP POLICY IF EXISTS "Admins can manage form templates" ON public.form_templates;
DROP POLICY IF EXISTS "Admins can manage service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
DROP POLICY IF EXISTS "Admins can see all clinics" ON public.clinics;
DROP POLICY IF EXISTS "Admins have full access to medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Admins have full access to profiles." ON public.profiles;
DROP POLICY IF EXISTS "Allow full access to admin users on inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow full access to admin users on item batches" ON public.inventory_item_batches;
DROP POLICY IF EXISTS "Allow full access to admin users on suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admins have full access to providers" ON public.providers; -- From previous attempt

-- Now that policies are gone, drop the functions they depended on.
DROP FUNCTION IF EXISTS public.is_admin(text);
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.current_user_clerk_id();

-- Drop the user_roles table as it's an unused artifact.
DROP TABLE IF EXISTS public.user_roles;

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