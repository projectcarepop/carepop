CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Create public.specialties table first as it's a lookup table
CREATE TABLE IF NOT EXISTS public.specialties (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- From CREATE INDEX idx_specialties_name_fts
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.specialties IS 'Lookup table for healthcare provider specialties.';

-- Create public.facilities table
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    email TEXT, -- Inferred from FTS index
    coordinates GEOMETRY(Point, 4326), -- From CREATE INDEX idx_facilities_coordinates_gist
    services_offered TEXT[], -- Inferred from FTS index
    is_active BOOLEAN DEFAULT TRUE NOT NULL, -- From CREATE INDEX idx_facilities_is_active
    -- operating_hours, social_media_links, contact_person_name, contact_numbers, accepting_new_patients will be added by ALTER
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    -- Potentially add: is_lgbtqia_affirming BOOLEAN
);

COMMENT ON TABLE public.facilities IS 'Stores information about healthcare facilities or chapters.';

-- Create public.providers table
CREATE TABLE IF NOT EXISTS public.providers (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to an auth user if provider is a user
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    contact_email TEXT UNIQUE, -- Inferred from FTS index
    contact_phone TEXT UNIQUE, -- Inferred from FTS index
    coordinates GEOMETRY(Point, 4326), -- From CREATE INDEX idx_providers_coordinates_gist
    is_active BOOLEAN DEFAULT TRUE NOT NULL, -- From CREATE INDEX idx_providers_is_active
    -- accepting_new_patients will be added by ALTER
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    -- Potentially add: is_lgbtqia_affirming BOOLEAN, professional_statement TEXT, languages_spoken TEXT[]
);

COMMENT ON TABLE public.providers IS 'Stores information about healthcare providers.';
COMMENT ON COLUMN public.providers.user_id IS 'Optional link to an auth.users account if the provider manages their own profile.';


-- Create public.provider_specialties linking table (many-to-many between providers and specialties)
CREATE TABLE IF NOT EXISTS public.provider_specialties (
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (provider_id, specialty_id)
);

COMMENT ON TABLE public.provider_specialties IS 'Links providers to their specialties.';

-- Create public.provider_facilities linking table (many-to-many between providers and facilities)
CREATE TABLE IF NOT EXISTS public.provider_facilities (
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (provider_id, facility_id)
);

COMMENT ON TABLE public.provider_facilities IS 'Links providers to the facilities they operate at.';

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'provider')) -- Example roles, adjust as needed
);
COMMENT ON TABLE public.user_roles IS 'Stores roles for users, linking to their auth.users ID.';
COMMENT ON COLUMN public.user_roles.role IS 'User role, e.g., user, admin, provider.';

-- Trigger to update 'updated_at' timestamp automatically for relevant tables
DROP TRIGGER IF EXISTS handle_facilities_updated_at ON public.facilities;
CREATE TRIGGER handle_facilities_updated_at BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime('updated_at');

DROP TRIGGER IF EXISTS handle_providers_updated_at ON public.providers;
CREATE TRIGGER handle_providers_updated_at BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime('updated_at');

DROP TRIGGER IF EXISTS handle_specialties_updated_at ON public.specialties;
CREATE TRIGGER handle_specialties_updated_at BEFORE UPDATE ON public.specialties
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime('updated_at');

-- Note: Linking tables provider_specialties and provider_facilities typically don't have updated_at
-- unless you need to track when the association itself was last modified.


-- Ticket DIR-1: Refine Provider/Facility Database Schema & Add Indexing
-- This migration enhances the directory tables for FPOP NCR alignment,
-- location-based search, availability indicators, and performance.

BEGIN;

-- Schema Enhancements for public.facilities
ALTER TABLE public.facilities
    ADD COLUMN IF NOT EXISTS operating_hours JSONB NULL,
    ADD COLUMN IF NOT EXISTS social_media_links JSONB NULL,
    ADD COLUMN IF NOT EXISTS contact_person_name TEXT NULL,
    ADD COLUMN IF NOT EXISTS contact_numbers TEXT[] NULL,
    ADD COLUMN IF NOT EXISTS accepting_new_patients BOOLEAN DEFAULT TRUE NOT NULL;

COMMENT ON COLUMN public.facilities.operating_hours IS 'Clinic hours and schedule, e.g., {"monday": "9am-5pm", "notes": "By appointment"}';
COMMENT ON COLUMN public.facilities.social_media_links IS 'Social media links, e.g., {"facebook": "url", "website": "url"}';
COMMENT ON COLUMN public.facilities.contact_person_name IS 'Name of the contact person for the facility/chapter.';
COMMENT ON COLUMN public.facilities.contact_numbers IS 'Array of contact phone numbers for the facility.';
COMMENT ON COLUMN public.facilities.accepting_new_patients IS 'Indicates if the facility is currently accepting new patients. Default TRUE.';

-- Schema Enhancements for public.providers
ALTER TABLE public.providers
    ADD COLUMN IF NOT EXISTS accepting_new_patients BOOLEAN DEFAULT TRUE NOT NULL;

COMMENT ON COLUMN public.providers.accepting_new_patients IS 'Indicates if the provider is currently accepting new patients. Default TRUE.';

-- Advanced Indexing

-- PostGIS Spatial Indexes (for "Near Me" search)
-- Assuming 'coordinates GEOMETRY(Point, 4326)' column exists in both tables.
CREATE INDEX IF NOT EXISTS idx_facilities_coordinates_gist ON public.facilities USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_providers_coordinates_gist ON public.providers USING GIST (coordinates);

-- Full-Text Search (FTS) Indexes

-- Function to generate tsvector for facilities, marked IMMUTABLE
CREATE OR REPLACE FUNCTION public.generate_facility_tsvector(
    _name TEXT,
    _address TEXT,
    _email TEXT,
    _services_offered TEXT[],
    _contact_person_name TEXT,
    _contact_numbers TEXT[]
)
RETURNS tsvector
AS $$
BEGIN
    RETURN to_tsvector('simple',
        coalesce(_name, '') || ' ' ||
        coalesce(_address, '') || ' ' ||
        coalesce(_email, '') || ' ' ||
        coalesce(array_to_string(_services_offered, ' '), '') || ' ' ||
        coalesce(_contact_person_name, '') || ' ' ||
        coalesce(array_to_string(_contact_numbers, ' '), '')
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- For public.facilities
-- Assuming 'name', 'address' (TEXT), 'email' (TEXT), 'services_offered' (TEXT[]), 'contact_person_name' (TEXT), 'contact_numbers' (TEXT[]) columns exist.
-- Using 'simple' dictionary for broader matching, consider language-specific if needed.
DROP INDEX IF EXISTS idx_facilities_fts;
CREATE INDEX idx_facilities_fts ON public.facilities USING GIN (
    public.generate_facility_tsvector(name, address, email, services_offered, contact_person_name, contact_numbers)
);

-- Function to generate tsvector for providers, marked IMMUTABLE
CREATE OR REPLACE FUNCTION public.generate_provider_tsvector(
    _first_name TEXT,
    _last_name TEXT,
    _contact_email TEXT,
    _contact_phone TEXT
)
RETURNS tsvector
AS $$
BEGIN
    RETURN to_tsvector('simple',
        coalesce(_first_name, '') || ' ' ||
        coalesce(_last_name, '') || ' ' ||
        coalesce(_contact_email, '') || ' ' ||
        coalesce(_contact_phone, '')
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- For public.providers
-- Assuming 'first_name' (TEXT), 'last_name' (TEXT), 'contact_email' (TEXT) columns exist.
-- From schema context, providers have 'contact_email' and 'contact_phone'
DROP INDEX IF EXISTS idx_providers_fts;
CREATE INDEX idx_providers_fts ON public.providers USING GIN (
    public.generate_provider_tsvector(first_name, last_name, contact_email, contact_phone)
);

-- For public.specialties (as it's linked and searched)
-- Assuming 'name' (TEXT) column exists.
CREATE INDEX IF NOT EXISTS idx_specialties_name_fts ON public.specialties USING GIN (to_tsvector('simple', name));


-- Standard B-tree Indexes for Filtering

-- For public.facilities
CREATE INDEX IF NOT EXISTS idx_facilities_is_active ON public.facilities(is_active);
CREATE INDEX IF NOT EXISTS idx_facilities_accepting_new_patients ON public.facilities(accepting_new_patients);
-- Assuming 'is_lgbtqia_affirming BOOLEAN' column might exist or be planned.
-- CREATE INDEX IF NOT EXISTS idx_facilities_is_lgbtqia_affirming ON public.facilities(is_lgbtqia_affirming);

-- For public.providers
CREATE INDEX IF NOT EXISTS idx_providers_is_active ON public.providers(is_active);
CREATE INDEX IF NOT EXISTS idx_providers_accepting_new_patients ON public.providers(accepting_new_patients);
-- Assuming 'is_lgbtqia_affirming BOOLEAN' column might exist or be planned.
-- CREATE INDEX IF NOT EXISTS idx_providers_is_lgbtqia_affirming ON public.providers(is_lgbtqia_affirming);

COMMIT;

-- Function to check if a user is an admin
-- IMPORTANT: Place this function definition BEFORE any RLS policies that use it.
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
AS $$
DECLARE
    is_admin_user BOOLEAN;
BEGIN
    -- Ensure search_path is set to prevent hijacking, especially with SECURITY DEFINER
    -- SET search_path = public; -- Usually not needed if function is schema-qualified (public.user_roles)
                               -- and objects within are also schema-qualified or in public.
                               -- However, it's good practice for SECURITY DEFINER functions.
                               -- For Supabase, function execution context might handle this.
                               -- Let's be explicit if issues arise.

    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = check_user_id AND role = 'admin'
    ) INTO is_admin_user;
    RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE; -- STABLE is appropriate if it only queries DB and gives same result for same input in one transaction
                                         -- IMMUTABLE if it *never* changes for same input across transactions (unlikely here as roles can change)
                                         -- Mark as STABLE. If issues, consider IMMUTABLE only if underlying role data truly never changes for a user once set.

-- Ensure RLS is enabled on relevant tables
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY; -- Also enable RLS on user_roles

-- ==== Policies for public.facilities ====
-- Public read access to active facilities
CREATE POLICY "Allow public read access to active facilities"
    ON public.facilities
    FOR SELECT
    USING (is_active = true);

-- Admin full access to facilities
CREATE POLICY "Allow admin full access to facilities"
    ON public.facilities
    FOR ALL -- Covers SELECT, INSERT, UPDATE, DELETE
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ==== Policies for public.providers ====
-- Public read access to active providers
CREATE POLICY "Allow public read access to active providers"
    ON public.providers
    FOR SELECT
    USING (is_active = true);

-- Policy for providers to update their own profile (if user_id link exists and is populated)
CREATE POLICY "Allow provider to update own linked profile details"
    ON public.providers
    FOR UPDATE
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);
    -- Note: INSERT for providers should likely be an admin-only or a specific backend process.

-- Admin full access to providers
CREATE POLICY "Allow admin full access to providers"
    ON public.providers
    FOR ALL -- Covers SELECT, INSERT, UPDATE, DELETE
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ==== Policies for public.specialties (Lookup table) ====
-- Public read access to specialties
CREATE POLICY "Allow public read access to specialties"
    ON public.specialties
    FOR SELECT
    USING (true);

-- Admin full access to specialties
CREATE POLICY "Allow admin full access to specialties"
    ON public.specialties
    FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ==== Policies for public.provider_specialties (Linking table) ====
-- Public read access
CREATE POLICY "Allow public read access to provider specialties"
    ON public.provider_specialties
    FOR SELECT
    USING (true); -- Assumes that if one can see a provider, one can see their linked specialties.
                   -- Could be restricted further if needed by joining to active providers.

-- Admin full access
CREATE POLICY "Allow admin full access to provider specialties"
    ON public.provider_specialties
    FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ==== Policies for public.provider_facilities (Linking table) ====
-- Public read access
CREATE POLICY "Allow public read access to provider facilities"
    ON public.provider_facilities
    FOR SELECT
    USING (true); -- Assumes that if one can see a provider/facility, one can see their link.
                   -- Could be restricted further.

-- Admin full access
CREATE POLICY "Allow admin full access to provider facilities"
    ON public.provider_facilities
    FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ==== RLS Policies for public.user_roles ====
-- Admins can manage all roles
CREATE POLICY "Allow admin full access to user_roles"
    ON public.user_roles
    FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Users can view their own role (optional, depending on whether users should see their role)
CREATE POLICY "Allow user to view their own role"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);


-- Ensure the public.is_admin function is robustly defined and works as intended.
-- The SECURITY DEFINER clause on helper functions like is_admin() is crucial
-- to allow them to query tables like user_roles without the calling user
-- needing direct SELECT permission on those role tables. 