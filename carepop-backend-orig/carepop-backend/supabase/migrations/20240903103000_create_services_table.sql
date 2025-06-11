CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    typical_duration_minutes INTEGER,
    requires_provider_assignment BOOLEAN NOT NULL DEFAULT FALSE,
    additional_details JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at_services
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- RLS Policies
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active services" ON public.services
AS PERMISSIVE FOR SELECT
TO public
USING (is_active = TRUE);

CREATE POLICY "Admins can manage services" ON public.services
AS PERMISSIVE FOR ALL
TO service_role; -- Or a specific admin role if you have one

-- Comments for clarity
COMMENT ON COLUMN public.services.category IS 'E.g., Consultation, Procedure, Family Planning, Testing';
COMMENT ON COLUMN public.services.requires_provider_assignment IS 'TRUE if a specific doctor/provider must be assigned, FALSE if any qualified staff can perform'; 