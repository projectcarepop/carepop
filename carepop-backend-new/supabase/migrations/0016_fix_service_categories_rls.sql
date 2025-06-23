-- Migration: 0016_fix_service_categories_rls.sql
-- Description: This migration fixes the RLS policy on the service_categories table.
-- The previous policy was causing errors by calling the is_admin function with an
-- incorrect data type (uuid instead of text).

-- Drop the old, faulty policy if it exists.
DROP POLICY IF EXISTS "Admins can manage service categories" ON public.service_categories;

-- Recreate the policy with the correct, parameter-less is_admin() function.
CREATE POLICY "Admins can manage service categories"
ON public.service_categories
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Also, ensure that all authenticated users can read the categories for the booking flow.
DROP POLICY IF EXISTS "Authenticated users can read service categories" ON public.service_categories;
CREATE POLICY "Authenticated users can read service categories"
ON public.service_categories
FOR SELECT
TO authenticated
USING (true); 