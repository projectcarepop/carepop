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
