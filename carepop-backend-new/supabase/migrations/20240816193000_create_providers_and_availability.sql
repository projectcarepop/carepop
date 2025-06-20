-- Migration to create providers, their availability, and link to specializations.

-- 1. Providers Table 
-- Stores all provider-specific professional information.
CREATE TABLE public.providers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    license_number TEXT UNIQUE,
    bio TEXT,
    accepting_new_patients BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.providers IS 'Provider-specific professional information.';
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for providers:
CREATE POLICY "Public can view provider info" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Providers can update their own info" ON public.providers FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all provider info" ON public.providers FOR ALL USING (public.is_admin(auth.uid()));


-- 2. Provider Availability Table
-- Stores the weekly recurring availability for a provider.
CREATE TABLE public.provider_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE (provider_id, day_of_week)
);

COMMENT ON TABLE public.provider_availability IS 'Stores recurring weekly availability for providers.';
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for availability:
CREATE POLICY "Public can view provider availability" ON public.provider_availability FOR SELECT USING (true);
CREATE POLICY "Providers can manage their own availability" ON public.provider_availability FOR ALL USING (auth.uid() = provider_id);
CREATE POLICY "Admins can manage all availability" ON public.provider_availability FOR ALL USING (public.is_admin(auth.uid()));


-- 3. Provider Specializations (Join Table)
-- Links providers to the specializations they are qualified for (many-to-many).
-- Depends on both `providers` (in this file) and `specializations` (in a previous migration).
CREATE TABLE public.provider_specializations (
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    specialization_id UUID NOT NULL REFERENCES public.specializations(id) ON DELETE CASCADE,
    PRIMARY KEY (provider_id, specialization_id)
);
COMMENT ON TABLE public.provider_specializations IS 'Links providers to their specializations.';
ALTER TABLE public.provider_specializations ENABLE ROW LEVEL SECURITY;

-- RLS for provider_specializations:
CREATE POLICY "Public can view provider specializations" ON public.provider_specializations FOR SELECT USING (true);
CREATE POLICY "Providers can manage their own specializations" ON public.provider_specializations FOR ALL USING (auth.uid() = provider_id);
CREATE POLICY "Admins can manage all provider specializations" ON public.provider_specializations FOR ALL USING (public.is_admin(auth.uid())); 