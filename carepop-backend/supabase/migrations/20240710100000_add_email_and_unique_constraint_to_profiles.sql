-- Add email column to public.profiles if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add a UNIQUE constraint to the email column
-- This will fail if there are duplicate emails already in the table,
-- so ensure data is clean or handle conflicts before applying in production.
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Update the comment for the email column
COMMENT ON COLUMN public.profiles.email IS '[SPI/PHI] User''s email address, must be unique. Typically synced from auth.users.email.';

-- If the handle_new_user trigger needs to be updated to populate this email
-- from NEW.email (from auth.users), that trigger should also be reviewed/updated
-- in a separate step or as part of this logical change if it's managed via migrations.
-- Assuming the trigger `handle_new_user` already correctly attempts to insert `NEW.email` into an `email` column. 