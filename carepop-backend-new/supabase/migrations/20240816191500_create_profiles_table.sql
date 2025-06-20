-- Profiles Table
-- Stores public-facing and detailed information for each user.
CREATE TABLE public.profiles (
    -- The primary key is the user's ID from the auth.users table.
    -- This creates a one-to-one relationship.
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Personal Details
    first_name TEXT,
    last_name TEXT,
    middle_initial VARCHAR(2),
    date_of_birth DATE,
    contact_no TEXT,
    avatar_url TEXT, -- To store URL of a profile picture

    -- Demographics (SOGIE & personal info)
    -- Using TEXT allows flexibility (e.g., 'Prefer to self-describe').
    gender_identity TEXT,
    pronouns TEXT,
    assigned_sex_at_birth TEXT,
    civil_status TEXT,
    religion TEXT,

    -- Professional & Health
    occupation TEXT,
    philhealth_no TEXT,

    -- Address Information
    -- Storing the PSGC codes is the correct approach.
    street TEXT,
    barangay_code VARCHAR(10),
    city_municipality_code VARCHAR(10),
    province_code VARCHAR(10),
    
    -- Timestamps managed automatically
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.moddatetime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at timestamp on any change
CREATE TRIGGER handle_profile_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE public.moddatetime();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add comments to the table and columns for clarity in database explorers.
COMMENT ON TABLE public.profiles IS 'Stores public-facing and detailed information for each user.';
COMMENT ON COLUMN public.profiles.id IS 'Links to auth.users table.';

-- Policies for Profiles Table

-- 1. Users can see their own profile.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Users can update their own profile.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Service roles can create new profiles (used during user registration).
CREATE POLICY "Service role can create profiles."
ON public.profiles FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- 4. Admins have full access.
CREATE POLICY "Admins have full access to profiles."
ON public.profiles FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid())); 