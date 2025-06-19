-- Dropping old, deprecated tables first to avoid conflicts.
-- These tables lack the required service_id link for our new booking flow.
DROP TABLE IF EXISTS public.provider_schedule_overrides;
DROP TABLE IF EXISTS public.provider_weekly_schedules;
DROP TABLE IF EXISTS public.provider_availability;
DROP TYPE IF EXISTS public.availability_slot_type_enum;

-- Table for provider's general weekly repeating schedules, now linked to a specific service.
CREATE TABLE public.provider_weekly_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sun, 6=Sat
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_start_before_end CHECK (start_time < end_time),
    -- A provider can have a schedule for the same day/clinic if it's for a different service.
    CONSTRAINT uq_provider_clinic_day_service UNIQUE (provider_id, clinic_id, day_of_week, service_id) 
);

COMMENT ON TABLE public.provider_weekly_schedules IS 'Stores a provider''s recurring weekly schedule, tied to a specific service they offer at a clinic.';
COMMENT ON COLUMN public.provider_weekly_schedules.day_of_week IS 'Day of the week: 0 for Sunday, 1 for Monday, ..., 6 for Saturday.';
COMMENT ON COLUMN public.provider_weekly_schedules.service_id IS 'The specific service this schedule applies to.';

-- Table for one-off availability changes (e.g., holidays, special hours, block-offs).
CREATE TABLE public.provider_availability_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    override_date DATE NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    is_available BOOLEAN NOT NULL, -- TRUE for adding availability, FALSE for blocking it off.
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE, -- Can be null if a block-off applies to all services.
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE, -- Overrides are clinic-specific.
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_override_start_before_end CHECK (start_time < end_time)
);

COMMENT ON TABLE public.provider_availability_overrides IS 'Defines one-off additions or block-offs to a provider''s schedule for a specific date.';
COMMENT ON COLUMN public.provider_availability_overrides.is_available IS 'TRUE if this is a block of time the provider IS available; FALSE if it''s a block-off.';
COMMENT ON COLUMN public.provider_availability_overrides.service_id IS 'If not null, the override only applies to this service. If null and is_available=false, it can block all services for that time.';

-- Apply updated_at triggers
CREATE OR REPLACE TRIGGER set_provider_weekly_schedules_updated_at
BEFORE UPDATE ON public.provider_weekly_schedules
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE OR REPLACE TRIGGER set_provider_availability_overrides_updated_at
BEFORE UPDATE ON public.provider_availability_overrides
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

-- RLS Policies
ALTER TABLE public.provider_weekly_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_availability_overrides ENABLE ROW LEVEL SECURITY;

-- Allow public read access for booking flow
CREATE POLICY "Allow public read access on weekly schedules"
ON public.provider_weekly_schedules
FOR SELECT
USING (true);

CREATE POLICY "Allow public read access on availability overrides"
ON public.provider_availability_overrides
FOR SELECT
USING (true);

-- Admins have full access
CREATE POLICY "Enable full access for admins on weekly schedules"
ON public.provider_weekly_schedules
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Enable full access for admins on availability overrides"
ON public.provider_availability_overrides
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Providers can manage their own schedules
CREATE POLICY "Providers can manage their own weekly schedules"
ON public.provider_weekly_schedules
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND provider_id = public.provider_weekly_schedules.provider_id
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND provider_id = public.provider_weekly_schedules.provider_id
));

CREATE POLICY "Providers can manage their own availability overrides"
ON public.provider_availability_overrides
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND provider_id = public.provider_availability_overrides.provider_id
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND provider_id = public.provider_availability_overrides.provider_id
)); 