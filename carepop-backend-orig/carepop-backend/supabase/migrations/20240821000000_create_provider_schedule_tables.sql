-- Supabase SQL Migration: Create provider schedule tables

-- Enable TIME type if not already (usually enabled by default)
-- CREATE EXTENSION IF NOT EXISTS "citext"; -- Example, not needed for TIME

BEGIN;

-- Table for provider's general weekly repeating schedules
CREATE TABLE IF NOT EXISTS public.provider_weekly_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE, -- Assuming availability is clinic-specific
    day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_start_before_end CHECK (start_time < end_time),
    CONSTRAINT uq_provider_clinic_day UNIQUE (provider_id, clinic_id, day_of_week) -- Ensures one schedule entry per provider, per clinic, per day
);

COMMENT ON COLUMN public.provider_weekly_schedules.day_of_week IS '0 for Sunday, 1 for Monday, ..., 6 for Saturday';
COMMENT ON CONSTRAINT uq_provider_clinic_day ON public.provider_weekly_schedules IS 'Ensures a provider does not have multiple general weekly schedules for the same day at the same clinic.';

-- Table for specific date overrides (e.g., holidays, one-off availability/unavailability)
CREATE TABLE IF NOT EXISTS public.provider_schedule_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE, -- Optional: if null, override applies to provider generally for that day
    override_date DATE NOT NULL,
    start_time TIME WITHOUT TIME ZONE, -- Null if unavailable for the whole day
    end_time TIME WITHOUT TIME ZONE,   -- Null if unavailable for the whole day
    is_available BOOLEAN NOT NULL, -- TRUE if this is a specific block of availability, FALSE if it's a block of unavailability
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_override_times CHECK (
        (is_available = FALSE AND start_time IS NULL AND end_time IS NULL) OR -- Unavailability for the whole day
        (is_available = TRUE AND start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time) OR -- Specific available block
        (is_available = FALSE AND start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time) -- Specific unavailable block (e.g. lunch break)
    )
);

COMMENT ON COLUMN public.provider_schedule_overrides.clinic_id IS 'If NULL, this override applies to the provider generally for the override_date, not specific to one clinic.';
COMMENT ON COLUMN public.provider_schedule_overrides.is_available IS 'TRUE if this record defines a period of availability; FALSE if it defines a period of unavailability.';
COMMENT ON COLUMN public.provider_schedule_overrides.start_time IS 'Required if is_available is TRUE. Can be set with is_available=FALSE to define a specific unavailable block (like a lunch break).';
COMMENT ON COLUMN public.provider_schedule_overrides.end_time IS 'Required if is_available is TRUE. Can be set with is_available=FALSE to define a specific unavailable block (like a lunch break).';

-- Triggers to automatically update updated_at timestamps
CREATE OR REPLACE TRIGGER set_provider_weekly_schedules_updated_at
BEFORE UPDATE ON public.provider_weekly_schedules
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE OR REPLACE TRIGGER set_provider_schedule_overrides_updated_at
BEFORE UPDATE ON public.provider_schedule_overrides
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

-- RLS Policies (Basic placeholders - to be refined based on roles: Provider, Clinic Admin, System Admin)

-- provider_weekly_schedules
ALTER TABLE public.provider_weekly_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their own weekly schedules" 
ON public.provider_weekly_schedules
FOR ALL
USING (auth.uid() = provider_id); -- Simplified: Needs role check or linking users to providers

CREATE POLICY "Authenticated users can read active weekly schedules" 
ON public.provider_weekly_schedules
FOR SELECT
USING (is_active = TRUE AND auth.role() = 'authenticated'); -- Allows logged-in users to see schedules, might be too broad.

-- provider_schedule_overrides
ALTER TABLE public.provider_schedule_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their own schedule overrides" 
ON public.provider_schedule_overrides
FOR ALL
USING (auth.uid() = provider_id); -- Simplified: Needs role check or linking users to providers

CREATE POLICY "Authenticated users can read schedule overrides"
ON public.provider_schedule_overrides
FOR SELECT
USING (auth.role() = 'authenticated'); -- Allows logged-in users to see overrides, might be too broad.

COMMIT; 