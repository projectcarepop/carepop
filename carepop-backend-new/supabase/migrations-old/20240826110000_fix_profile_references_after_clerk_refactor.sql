-- Migration to fix table references to the profiles table after it was refactored to use clerk_id as the primary key.

-- Step 1: Fix the 'providers' table.
-- The providers.id column should be of type TEXT and reference profiles.clerk_id.
-- We must first drop the dependent foreign key in provider_specializations.
ALTER TABLE public.provider_specializations DROP CONSTRAINT IF EXISTS provider_specializations_provider_id_fkey;
ALTER TABLE public.provider_availability DROP CONSTRAINT IF EXISTS provider_availability_provider_id_fkey;

-- Now drop the primary key constraint on providers, which also has the foreign key we need to change.
ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS providers_pkey CASCADE;

-- Change the data type of the 'id' column in providers from UUID to TEXT.
ALTER TABLE public.providers ALTER COLUMN id TYPE TEXT;

-- Re-establish the primary key.
ALTER TABLE public.providers ADD PRIMARY KEY (id);

-- Re-add the foreign key constraint to reference profiles(clerk_id).
ALTER TABLE public.providers
ADD CONSTRAINT providers_id_fkey
FOREIGN KEY (id) REFERENCES public.profiles(clerk_id) ON DELETE CASCADE;

-- Re-add the dependent foreign keys we dropped earlier.
ALTER TABLE public.provider_availability
ADD CONSTRAINT provider_availability_provider_id_fkey
FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;

ALTER TABLE public.provider_specializations
ADD CONSTRAINT provider_specializations_provider_id_fkey
FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


-- Step 2: Fix the 'appointments' table.
-- The user_id column needs to be changed from UUID to TEXT.
-- It references profiles, but it's not a primary key, so it's a simpler change.
ALTER TABLE public.appointments
ALTER COLUMN user_id TYPE TEXT;

-- We need to drop the old FK and add a new one. The name was likely implicit.
-- To be safe, let's find the constraint name first.
-- In Supabase, it is often of the form "appointments_user_id_fkey".
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;
ALTER TABLE public.appointments
ADD CONSTRAINT appointments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(clerk_id) ON DELETE SET NULL;

-- Step 3: Fix the 'appointments' provider_id reference.
-- The provider_id also needs to be TEXT.
ALTER TABLE public.appointments
ALTER COLUMN provider_id TYPE TEXT;

ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_provider_id_fkey;
ALTER TABLE public.appointments
ADD CONSTRAINT appointments_provider_id_fkey
FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE SET NULL;

-- Step 4: Fix provider_availability provider_id reference
-- This was a UUID referencing a UUID. Now both must be TEXT.
ALTER TABLE public.provider_availability
ALTER COLUMN provider_id TYPE TEXT;

-- Step 5: Fix provider_specializations provider_id reference
ALTER TABLE public.provider_specializations
ALTER COLUMN provider_id TYPE TEXT; 