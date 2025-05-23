-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Create the clinics table
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    full_address TEXT,
    street_address TEXT,
    locality TEXT, -- e.g., City/Municipality
    region TEXT, -- e.g., NCR
    postal_code TEXT,
    country_code TEXT DEFAULT 'PH',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    contact_phone TEXT,
    contact_email TEXT,
    website_url TEXT,
    operating_hours JSONB, -- e.g., {"Mon": "9am-5pm", "Tue": "9am-5pm", "Notes": "Closed on public holidays"}
    services_offered TEXT[], -- e.g., ARRAY['Family Planning', 'SRH Counseling', 'HIV Testing']
    fpop_chapter_affiliation TEXT, -- e.g. "NCR - Central Office"
    additional_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comments to table and columns for clarity
COMMENT ON TABLE public.clinics IS 'Stores information about healthcare clinics and facilities.';
COMMENT ON COLUMN public.clinics.operating_hours IS 'Structured opening hours, e.g., {"Mon": "09:00-17:00", "Tue": "09:00-17:00"}. Can also include notes.';
COMMENT ON COLUMN public.clinics.services_offered IS 'Array of service tags offered by the clinic.';

-- Create a GIST index for efficient spatial queries using PostGIS
-- This assumes longitude is first, then latitude for ST_MakePoint.
-- If your PostGIS version/setup expects lat, lon, adjust accordingly.
-- Supabase enables PostGIS in the 'extensions' schema by default for new projects.
-- For direct use of ST_MakePoint, ensure PostGIS is in search_path or use extensions.ST_MakePoint
CREATE INDEX idx_clinics_location ON public.clinics USING GIST (extensions.st_point(longitude, latitude));
-- ALTERNATIVE using geography type for more accurate global distance calculations if needed later:
-- CREATE INDEX idx_clinics_location_geog ON public.clinics USING GIST (ST_MakePoint(longitude, latitude)::geography);

-- Enable Row Level Security (RLS) on the clinics table
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Grant usage on the public schema to anon and authenticated roles
-- These roles are standard in Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select access to relevant roles for the clinics table
GRANT SELECT ON TABLE public.clinics TO anon, authenticated;

-- RLS Policy: Allow public read access to active clinics
CREATE POLICY "Allow public read access to active clinics"
ON public.clinics
FOR SELECT
TO anon, authenticated -- Both anonymous and logged-in users can read
USING (is_active = TRUE);

-- RLS Policy: Allow admin users full access (placeholder for admin role logic)
-- This assumes an 'admin' role exists or relies on backend using service_role for admin operations.
-- For true admin role based RLS:
-- CREATE POLICY "Allow full access for admin users"
-- ON public.clinics
-- FOR ALL
-- TO authenticated -- Admins must be authenticated
-- USING (auth.role() = 'admin_role_name_in_supabase') -- Replace 'admin_role_name_in_supabase'
-- WITH CHECK (auth.role() = 'admin_role_name_in_supabase');
-- For now, admin access will be handled by backend services using service_role key, bypassing RLS for mutations.

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on row update
CREATE TRIGGER trigger_clinics_updated_at
BEFORE UPDATE ON public.clinics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- (Optional for P2+) clinic_images table
-- CREATE TABLE public.clinic_images (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
--     image_url TEXT NOT NULL,
--     alt_text TEXT,
--     is_primary_image BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMPTZ DEFAULT now()
-- );
-- COMMENT ON TABLE public.clinic_images IS 'Stores images related to clinics.';
-- Enable RLS for clinic_images if created
-- ALTER TABLE public.clinic_images ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access to clinic images for active clinics"
-- ON public.clinic_images
-- FOR SELECT
-- TO anon, authenticated
-- USING (
--     EXISTS (
--         SELECT 1
--         FROM public.clinics c
--         WHERE c.id = clinic_id AND c.is_active = TRUE
--     )
-- ); 