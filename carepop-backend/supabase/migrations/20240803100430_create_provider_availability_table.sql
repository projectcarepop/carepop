-- Create ENUM type for slot_type if it doesn't exist (optional, but good practice)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'availability_slot_type_enum') THEN
        CREATE TYPE public.availability_slot_type_enum AS ENUM (
            'available',       -- Standard bookable slot
            'unavailable',     -- Specifically marked as unavailable (e.g., vacation, meeting)
            'break'            -- e.g., lunch break
        );
    END IF;
END$$;

-- Create provider_availability table
CREATE TABLE public.provider_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    slot_type public.availability_slot_type_enum NOT NULL DEFAULT 'available',
    is_active BOOLEAN NOT NULL DEFAULT TRUE, -- For soft deletes or temporarily hiding slots
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_start_before_end CHECK (start_time < end_time) -- Basic validation
);

-- Add indexes
CREATE INDEX idx_provider_availability_provider_id ON public.provider_availability(provider_id);
CREATE INDEX idx_provider_availability_start_time ON public.provider_availability(start_time);
CREATE INDEX idx_provider_availability_end_time ON public.provider_availability(end_time);
CREATE INDEX idx_provider_availability_slot_type ON public.provider_availability(slot_type);
CREATE INDEX idx_provider_availability_is_active ON public.provider_availability(is_active);

-- Add updated_at trigger (assuming set_current_timestamp_updated_at function exists)
CREATE TRIGGER handle_updated_at_provider_availability
BEFORE UPDATE ON public.provider_availability
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Comments
COMMENT ON TABLE public.provider_availability IS 'Stores specific availability slots for healthcare providers.';
COMMENT ON COLUMN public.provider_availability.provider_id IS 'The provider this availability slot belongs to.';
COMMENT ON COLUMN public.provider_availability.start_time IS 'The start date and time of the availability slot.';
COMMENT ON COLUMN public.provider_availability.end_time IS 'The end date and time of the availability slot.';
COMMENT ON COLUMN public.provider_availability.slot_type IS 'The type of availability (e.g., available, break).';
COMMENT ON COLUMN public.provider_availability.is_active IS 'Whether this availability slot is currently active and considered for booking.'; 