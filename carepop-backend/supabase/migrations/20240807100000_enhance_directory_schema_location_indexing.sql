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

-- For public.facilities
-- Assuming 'name', 'address' (TEXT), 'email' (TEXT), 'services_offered' (TEXT[]), 'contact_person_name' (TEXT), 'contact_numbers' (TEXT[]) columns exist.
-- Using 'simple' dictionary for broader matching, consider language-specific if needed.
DROP INDEX IF EXISTS idx_facilities_fts;
CREATE INDEX idx_facilities_fts ON public.facilities USING GIN (
    to_tsvector('simple', 
        coalesce(name, '') || ' ' || 
        coalesce(address, '') || ' ' || 
        coalesce(email, '') || ' ' || 
        coalesce(array_to_string(services_offered, ' '), '') || ' ' || 
        coalesce(contact_person_name, '') || ' ' || 
        coalesce(array_to_string(contact_numbers, ' '), '')
    )
);

-- For public.providers
-- Assuming 'first_name' (TEXT), 'last_name' (TEXT), 'contact_email' (TEXT) columns exist.
-- From schema context, providers have 'contact_email' and 'contact_phone'
DROP INDEX IF EXISTS idx_providers_fts;
CREATE INDEX idx_providers_fts ON public.providers USING GIN (
    to_tsvector('simple', 
        coalesce(first_name, '') || ' ' || 
        coalesce(last_name, '') || ' ' || 
        coalesce(contact_email, '') || ' ' || 
        coalesce(contact_phone, '')
    )
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