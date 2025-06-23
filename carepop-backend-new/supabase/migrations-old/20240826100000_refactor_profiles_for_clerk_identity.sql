-- Migration to align the profiles table with Clerk as the source of truth for user identity.

-- Step 1: Add a new clerk_id column to the profiles table.
-- It's nullable for now to allow adding it to a non-empty table.
ALTER TABLE public.profiles
ADD COLUMN clerk_id TEXT;

-- Step 2: Populate the new clerk_id with the existing Supabase auth user IDs.
-- In our old flow, the profile 'id' was the same as the auth.users 'id'.
-- For existing users, we assume the clerk_id is the same as the Supabase user_id.
-- New users will be created with the correct Clerk ID directly.
UPDATE public.profiles
SET clerk_id = id::text;

-- Step 3: Make the new clerk_id column NOT NULL and UNIQUE, as it will be the new primary key.
ALTER TABLE public.profiles
ALTER COLUMN clerk_id SET NOT NULL;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_clerk_id_unique UNIQUE (clerk_id);

-- Step 4: Drop the old primary key constraint and the foreign key relationship to auth.users.
-- This decouples our profiles from Supabase's internal auth table, making Clerk the master.
ALTER TABLE public.profiles
DROP CONSTRAINT profiles_pkey CASCADE;

-- The foreign key constraint is implicitly managed by the PRIMARY KEY reference, so we just drop the pkey.
-- If there was a named FK constraint, we would drop it here:
-- ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;


-- Step 5: Set the new clerk_id as the primary key.
ALTER TABLE public.profiles
ADD PRIMARY KEY (clerk_id);


-- Step 6: Update the user_roles table to use clerk_id.

-- Step 6a: Drop ALL existing policies and functions that depend on the user_id's UUID type.
-- Dependencies from appointments table
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
-- Dependencies from clinics tables
DROP POLICY IF EXISTS "Admins can see all clinics" ON public.clinics;
DROP POLICY IF EXISTS "Admins can manage clinics" ON public.clinics;
DROP POLICY IF EXISTS "Admins can manage clinic providers" ON public.clinic_providers;
DROP POLICY IF EXISTS "Admins can manage clinic services" ON public.clinic_services;
-- Dependencies from providers table
DROP POLICY IF EXISTS "Admins can manage all provider info" ON public.providers;
DROP POLICY IF EXISTS "Admins can manage all availability" ON public.provider_availability;
DROP POLICY IF EXISTS "Admins can manage all provider specializations" ON public.provider_specializations;
-- Dependencies from profiles and user_roles tables
DROP POLICY IF EXISTS "Admins have full access to profiles." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP FUNCTION IF EXISTS public.is_admin(uuid);
-- Dependencies from inventory tables
DROP POLICY IF EXISTS "Admins can manage inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Admins can manage inventory item batches" ON public.inventory_item_batches;
DROP POLICY IF EXISTS "Admins can manage suppliers" ON public.suppliers;
-- Dependencies from medical_records table
DROP POLICY IF EXISTS "Admins have full access to medical records" ON public.medical_records;
-- Dependencies from form_templates table
DROP POLICY IF EXISTS "Admins can manage form templates" ON public.form_templates;
-- Dependencies from specializations and services tables
DROP POLICY IF EXISTS "Admins can manage specializations" ON public.specializations;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

-- Step 6b: Now we can safely alter the column type.
ALTER TABLE public.user_roles
ALTER COLUMN user_id TYPE TEXT;

-- Step 6c: Recreate the helper function with the correct TEXT type signature.
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = p_user_id AND ur.role = 'admin'
    );
$$;

-- Step 6d: Recreate the policies with the correct type casting.
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Admins can manage all user roles"
ON public.user_roles FOR ALL
USING (public.is_admin(auth.uid()::text))
WITH CHECK (public.is_admin(auth.uid()::text));

-- Recreate policy on profiles table
CREATE POLICY "Admins have full access to profiles."
ON public.profiles FOR ALL
USING (public.is_admin(auth.uid()::text))
WITH CHECK (public.is_admin(auth.uid()::text));

-- Recreate policies on provider tables
CREATE POLICY "Admins can manage all provider info" ON public.providers FOR ALL USING (public.is_admin(auth.uid()::text));
CREATE POLICY "Admins can manage all availability" ON public.provider_availability FOR ALL USING (public.is_admin(auth.uid()::text));
CREATE POLICY "Admins can manage all provider specializations" ON public.provider_specializations FOR ALL USING (public.is_admin(auth.uid()::text));
-- Recreate policies on clinic tables
CREATE POLICY "Admins can see all clinics" ON public.clinics FOR SELECT USING (public.is_admin(auth.uid()::text));
CREATE POLICY "Admins can manage clinics" ON public.clinics FOR ALL USING (public.is_admin(auth.uid()::text));
CREATE POLICY "Admins can manage clinic providers" ON public.clinic_providers FOR ALL USING (public.is_admin(auth.uid()::text));
CREATE POLICY "Admins can manage clinic services" ON public.clinic_services FOR ALL USING (public.is_admin(auth.uid()::text));
-- Recreate policies on other tables
CREATE POLICY "Admins can view all appointments" ON public.appointments FOR SELECT USING (public.is_admin(auth.uid()::text));
CREATE POLICY "Admins can manage inventory items" ON public.inventory_items FOR ALL USING (public.is_admin(auth.uid()::text)) WITH CHECK (public.is_admin(auth.uid()::text));
CREATE POLICY "Admins can manage inventory item batches" ON public.inventory_item_batches FOR ALL USING (public.is_admin(auth.uid()::text)) WITH CHECK (public.is_admin(auth.uid()::text));
CREATE POLICY "Admins can manage suppliers" ON public.suppliers FOR ALL USING (public.is_admin(auth.uid()::text)) WITH CHECK (public.is_admin(auth.uid()::text));
CREATE POLICY "Admins have full access to medical records" ON public.medical_records FOR ALL USING (public.is_admin(auth.uid()::text));
CREATE POLICY "Admins can manage form templates" ON public.form_templates FOR ALL USING (public.is_admin(auth.uid()::text));
CREATE POLICY "Admins can manage specializations" ON public.specializations FOR ALL USING (public.is_admin(auth.uid()::text));
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.is_admin(auth.uid()::text));

-- Step 6e: Add the foreign key constraint. This must come after the policies are recreated.
-- Dropping the old one explicitly is good practice.
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(clerk_id) ON DELETE CASCADE;

-- Final Step: Remove the now-redundant 'id' column from profiles.
ALTER TABLE public.profiles
DROP COLUMN id;

COMMENT ON TABLE public.profiles IS 'Stores user profile information, with Clerk as the source of truth. The primary key `clerk_id` corresponds to the user ID from Clerk.';
COMMENT ON COLUMN public.profiles.clerk_id IS 'Primary key corresponding to the user ID from Clerk.'; 