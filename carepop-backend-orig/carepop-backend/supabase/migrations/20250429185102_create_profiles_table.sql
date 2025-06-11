-- Enable moddatetime extension if not already enabled globally
-- CREATE EXTENSION IF NOT EXISTS moddatetime; 
-- Note: It's often better to manage extensions in a separate, earlier migration 
-- or ensure it's enabled in your Supabase project settings.
-- Assuming it's enabled for now.

-- Create the profiles table linked to auth.users
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Links to Supabase Auth user
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,                                 -- [SPI/PHI]
  phone_number TEXT UNIQUE,                           -- [SPI/PHI] Potentially needs formatting/validation
  address TEXT,                                       -- [SPI/PHI]
  granular_consents JSONB DEFAULT '{}'::jsonb,        -- [SPI/PHI] e.g., {'allow_general_data_processing': true, 'allow_tracking_data_view_by_provider_<provider_id>': 'granted'}
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add comments describing the table and columns
COMMENT ON TABLE public.profiles IS 'Stores user profile information linked to Supabase auth users.';
COMMENT ON COLUMN public.profiles.user_id IS 'Link to the authenticated user in auth.users.';
COMMENT ON COLUMN public.profiles.date_of_birth IS '[SPI/PHI] User''s date of birth.';
COMMENT ON COLUMN public.profiles.phone_number IS '[SPI/PHI] User''s contact phone number.';
COMMENT ON COLUMN public.profiles.address IS '[SPI/PHI] User''s physical address.';
COMMENT ON COLUMN public.profiles.granular_consents IS '[SPI/PHI] Stores various user consent flags in JSON format.';

-- Trigger to update 'updated_at' timestamp automatically
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime('updated_at');

-- Enable Row Level Security (RLS) for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant usage permission for the public schema to the authenticated role
-- This is often necessary for RLS policies to function correctly for logged-in users
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant select, insert, update, delete permissions on the table to the authenticated role
-- RLS policies will further restrict which rows can be affected
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;

-- RLS Policy: Allow users to read their own profile
CREATE POLICY "Allow individual read access" ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Allow users to update their own profile
CREATE POLICY "Allow individual update access" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id); -- Ensure they can't change the user_id on update

-- RLS Policy: Allow users to insert their own profile (typically done once)
-- Note: This might be better handled by a trigger or backend function after signup
-- to ensure the user_id matches auth.uid(), but adding a basic policy here.
CREATE POLICY "Allow individual insert access" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: No delete policy is added initially. Deletion might require special handling.
