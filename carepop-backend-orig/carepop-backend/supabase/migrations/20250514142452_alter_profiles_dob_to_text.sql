-- Alter the data type of date_of_birth in public.profiles to TEXT
-- This is to allow storing encrypted date values.
-- The application layer will handle decryption and conversion back to a date object.

-- Ensure the column exists before trying to alter it (optional, but good practice)
DO $$
BEGIN
  IF EXISTS(
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE public.profiles
    ALTER COLUMN date_of_birth TYPE TEXT;

    RAISE NOTICE 'Column public.profiles.date_of_birth altered to TEXT.';
  ELSE
    RAISE NOTICE 'Column public.profiles.date_of_birth does not exist, no action taken.';
  END IF;
END $$;

-- Add SOGIE related columns if they don't already exist

-- Add gender_identity column
DO $$
BEGIN
  IF NOT EXISTS(
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'gender_identity'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN gender_identity TEXT;
    RAISE NOTICE 'Column public.profiles.gender_identity added.';
  ELSE
    RAISE NOTICE 'Column public.profiles.gender_identity already exists, no action taken.';
  END IF;
END $$;

-- Add pronouns column
DO $$
BEGIN
  IF NOT EXISTS(
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'pronouns'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN pronouns TEXT;
    RAISE NOTICE 'Column public.profiles.pronouns added.';
  ELSE
    RAISE NOTICE 'Column public.profiles.pronouns already exists, no action taken.';
  END IF;
END $$;

-- Add assigned_sex_at_birth column
DO $$
BEGIN
  IF NOT EXISTS(
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'assigned_sex_at_birth'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN assigned_sex_at_birth TEXT;
    RAISE NOTICE 'Column public.profiles.assigned_sex_at_birth added.';
  ELSE
    RAISE NOTICE 'Column public.profiles.assigned_sex_at_birth already exists, no action taken.';
  END IF;
END $$;

-- If there was any existing data in date_of_birth that was of DATE type,
-- and if this migration were to be applied to a database with such data,
-- those values would need to be handled. For a new system or if the column was already TEXT
-- or empty/null, this is less of a concern.
-- Example of how one might try to convert existing valid date strings if the column was VARCHAR but held 'YYYY-MM-DD':
-- UPDATE public.profiles SET date_of_birth = date_of_birth::TEXT WHERE date_of_birth IS NOT NULL;
-- However, since we are changing from (presumably) DATE to TEXT to store *encrypted* values,
-- any existing unencrypted DATEs would become unparseable text representations if not handled.
-- For this project, we assume this column will now store encrypted text or NULL.