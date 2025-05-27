-- Migration: Align provider_facilities to link to public.clinics
-- Drops the old FK to public.facilities, renames facility_id to clinic_id,
-- and adds a new FK to public.clinics.

BEGIN;

-- Step 1: Drop the existing foreign key constraint if it exists.
-- The constraint name 'provider_facilities_facility_id_fkey' is a common default.
-- If your constraint has a different name, you'll need to adjust this.
-- You can find the constraint name by inspecting the table in Supabase dashboard or using psql.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'provider_facilities_facility_id_fkey'
          AND conrelid = 'public.provider_facilities'::regclass
    ) THEN
        ALTER TABLE public.provider_facilities
        DROP CONSTRAINT provider_facilities_facility_id_fkey;
    END IF;
END $$;

-- Step 2: Rename the facility_id column to clinic_id if it exists and clinic_id doesn't.
DO $$
BEGIN
    IF EXISTS (SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'provider_facilities' AND column_name = 'facility_id') AND
       NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'provider_facilities' AND column_name = 'clinic_id') THEN
        ALTER TABLE public.provider_facilities
        RENAME COLUMN facility_id TO clinic_id;
    END IF;
END $$;

-- Step 3: Add the new foreign key constraint to public.clinics(id)
-- Ensure public.clinics table and its id column exist.
-- Adding IF NOT EXISTS for the constraint itself to be safe, though typically new constraints don't have this.
-- A more robust way is to check if the constraint already exists by name before adding.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'provider_facilities_clinic_id_fkey' -- Choose a name for the new constraint
          AND conrelid = 'public.provider_facilities'::regclass
    ) THEN
        ALTER TABLE public.provider_facilities
        ADD CONSTRAINT provider_facilities_clinic_id_fkey
        FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;
    END IF;
END $$;

COMMIT;
