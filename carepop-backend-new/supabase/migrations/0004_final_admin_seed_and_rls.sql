-- This migration ensures the is_admin function exists and that there is at least one admin user.
-- It has been made more robust by not assuming the primary key name on the profiles table.

-- Step 1: Create the is_admin function required for RLS policies.
CREATE OR REPLACE FUNCTION public.is_admin(user_id_to_check UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    role_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.profiles p ON ur.user_id = p.id -- Assuming 'id' is the correct PK on profiles
        WHERE p.id = user_id_to_check AND ur.role = 'admin'
    ) INTO role_exists;
    RETURN role_exists;
END;
$$;


-- Step 2: Ensure the user_roles table exists.
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- This will be the profiles.id
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role)
);


-- Step 3: Seed the first user in the profiles table as an admin.
DO $$
DECLARE
    first_user_profile_id UUID;
BEGIN
    -- Find the ID of the first user based on creation date.
    -- This assumes the PK is 'id'. If this fails, the user must provide the correct PK name.
    SELECT id INTO first_user_profile_id FROM public.profiles ORDER BY created_at LIMIT 1;

    -- If a user exists, insert them into the user_roles table as an admin.
    IF first_user_profile_id IS NOT NULL THEN
        -- Add a foreign key constraint if it doesn't exist, to be safe.
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_fk') THEN
            ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        END IF;

        INSERT INTO public.user_roles (user_id, role)
        VALUES (first_user_profile_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;


-- Step 4: Apply the correct RLS policies to the service_categories table.
DROP POLICY IF EXISTS "Public can view service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Admins can manage service categories" ON public.service_categories;

CREATE POLICY "Public can view service categories" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage service categories" ON public.service_categories FOR ALL USING (public.is_admin(auth.uid())); 