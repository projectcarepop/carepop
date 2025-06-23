-- Migration: 0010_destructive_rls_cleanup.sql
-- THIS IS A DESTRUCTIVE, CLEANUP-ONLY SCRIPT.
-- Its only purpose is to remove all known RLS policies and functions
-- that have caused conflicts, getting the database to a clean slate.
-- It does NOT create any new objects.

-- Drop all known conflicting policies explicitly to resolve dependency issues.
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
DROP POLICY IF EXISTS "Admins have full access to providers" ON public.providers;
DROP POLICY IF EXISTS "Public can view provider info" ON public.providers;
DROP POLICY IF EXISTS "Users can view their own profile, admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Now that policies are gone, drop the functions they depended on.
DROP FUNCTION IF EXISTS public.is_admin(text);
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.current_user_clerk_id();

-- Drop the user_roles table as it's an unused artifact.
DROP TABLE IF EXISTS public.user_roles; 