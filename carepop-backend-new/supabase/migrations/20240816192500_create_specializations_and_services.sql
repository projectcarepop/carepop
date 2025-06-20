-- Migration to create specializations and services tables.

-- 1. Specializations Table
-- This is the master list of medical specializations.
CREATE TABLE public.specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.specializations IS 'Master list of medical specializations (e.g., General Medicine).';
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;

-- RLS for specializations: public can read, admins can manage.
CREATE POLICY "Public can view specializations" ON public.specializations FOR SELECT USING (true);
CREATE POLICY "Admins can manage specializations" ON public.specializations FOR ALL USING (public.is_admin(auth.uid()));


-- 2. Services Table
-- This lists all services offered, each belonging to one specialization.
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialization_id UUID NOT NULL REFERENCES public.specializations(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    duration_minutes INT, -- Example: 30, 60
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.services IS 'All services offered, linked to a specialization.';
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS for services: public can read, admins can manage.
CREATE POLICY "Public can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.is_admin(auth.uid())); 