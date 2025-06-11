ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS middle_initial TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS age INT4, -- Can be calculated, but often stored for convenience
  ADD COLUMN IF NOT EXISTS civil_status TEXT,
  ADD COLUMN IF NOT EXISTS religion TEXT,
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS contact_no TEXT, -- App uses contact_no, current schema has phone_number
  ADD COLUMN IF NOT EXISTS street TEXT,     -- For more granular address
  ADD COLUMN IF NOT EXISTS barangay_code TEXT,  -- Store the code
  ADD COLUMN IF NOT EXISTS city_municipality_code TEXT, -- Store the code
  ADD COLUMN IF NOT EXISTS province_code TEXT,    -- Store the code
  ADD COLUMN IF NOT EXISTS philhealth_no TEXT;

-- Add comments for new columns
COMMENT ON COLUMN public.profiles.middle_initial IS 'User''s middle initial.';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL for the user''s profile picture.';
COMMENT ON COLUMN public.profiles.age IS 'User''s age, can be derived from date_of_birth but stored for query convenience.';
COMMENT ON COLUMN public.profiles.civil_status IS '[SPI/PHI] User''s civil status.';
COMMENT ON COLUMN public.profiles.religion IS 'User''s religion.';
COMMENT ON COLUMN public.profiles.occupation IS 'User''s occupation.';
COMMENT ON COLUMN public.profiles.contact_no IS '[SPI/PHI] User''s primary contact number (used by app forms).';
COMMENT ON COLUMN public.profiles.street IS '[SPI/PHI] User''s street address (part of structured address).';
COMMENT ON COLUMN public.profiles.barangay_code IS '[SPI/PHI] Code for user''s barangay (part of structured address).';
COMMENT ON COLUMN public.profiles.city_municipality_code IS '[SPI/PHI] Code for user''s city/municipality (part of structured address).';
COMMENT ON COLUMN public.profiles.province_code IS '[SPI/PHI] Code for user''s province (part of structured address).';
COMMENT ON COLUMN public.profiles.philhealth_no IS '[SPI/PHI] User''s PhilHealth identification number.';

-- Note on existing 'address TEXT' and 'phone_number TEXT UNIQUE' fields:
-- The 'address TEXT' field is generic. The newly added granular fields (street, barangay_code, etc.) are preferred for app functionality.
-- Consider migrating data from 'address' to new fields and deprecating/removing it, or making it nullable if retained for legacy purposes.
-- The 'phone_number TEXT UNIQUE' field exists. The app uses 'contact_no'. 
-- Evaluate if 'contact_no' should also be UNIQUE and if 'phone_number' can be deprecated/removed or if they serve different purposes.
-- For now, 'contact_no' is added to match application forms. If it becomes the primary, consider adding a UNIQUE constraint.

-- Example: If contact_no is to replace phone_number and be unique:
-- ALTER TABLE public.profiles ADD CONSTRAINT unique_contact_no UNIQUE (contact_no);
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone_number; 
-- (Above lines are commented out, decide on strategy first) 