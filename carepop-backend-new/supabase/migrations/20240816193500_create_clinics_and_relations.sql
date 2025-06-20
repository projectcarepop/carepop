-- Migration to create clinics and their relationships to providers and services.

-- 1. Clinics Table
-- Stores all information about a partner clinic.
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Address Components
    street_address TEXT,
    locality TEXT, -- City/Municipality
    region TEXT, -- Province/Region
    postal_code TEXT,
    country_code TEXT DEFAULT 'PH',

    -- Geolocation for mapping
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),

    -- Contact Info
    contact_phone TEXT,
    contact_email TEXT,

    -- Operational Details
    operation_days TEXT[], -- e.g., ARRAY['Monday', 'Tuesday', 'Friday']
    operation_hours TEXT, -- e.g., '9:00 AM - 5:00 PM'

    fpop_chapter_affiliation TEXT,
    additional_notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.clinics IS 'Stores all information about a partner clinic.';
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- RLS for clinics: Public can read, Admins can manage
CREATE POLICY "Public can view active clinics" ON public.clinics FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can see all clinics" ON public.clinics FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage clinics" ON public.clinics FOR ALL USING (public.is_admin(auth.uid()));


-- 2. Clinic Providers (Join Table)
-- Links providers to the clinics they work at (many-to-many).
CREATE TABLE public.clinic_providers (
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    PRIMARY KEY (clinic_id, provider_id)
);
COMMENT ON TABLE public.clinic_providers IS 'Links providers to the clinics they work at.';
ALTER TABLE public.clinic_providers ENABLE ROW LEVEL SECURITY;

-- RLS for clinic_providers: Public can read, Admins can manage.
CREATE POLICY "Public can view clinic provider associations" ON public.clinic_providers FOR SELECT USING (true);
CREATE POLICY "Admins can manage clinic providers" ON public.clinic_providers FOR ALL USING (public.is_admin(auth.uid()));


-- 3. Clinic Services (Join Table)
-- Links clinics to the services they offer (many-to-many).
CREATE TABLE public.clinic_services (
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    PRIMARY KEY (clinic_id, service_id)
);
COMMENT ON TABLE public.clinic_services IS 'Links clinics to the specific services they offer.';
ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;

-- RLS for clinic_services: Public can read, Admins can manage.
CREATE POLICY "Public can view clinic service associations" ON public.clinic_services FOR SELECT USING (true);
CREATE POLICY "Admins can manage clinic services" ON public.clinic_services FOR ALL USING (public.is_admin(auth.uid())); 