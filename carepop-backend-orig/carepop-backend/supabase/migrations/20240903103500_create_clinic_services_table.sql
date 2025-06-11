-- Ensure the updated_at function exists (idempotent)
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create clinic_services join table
CREATE TABLE public.clinic_services (
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    clinic_specific_price NUMERIC(10, 2), -- Assuming precision 10, scale 2 for currency
    is_offered BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (clinic_id, service_id)
);

-- Add indexes for foreign keys for performance
CREATE INDEX idx_clinic_services_clinic_id ON public.clinic_services(clinic_id);
CREATE INDEX idx_clinic_services_service_id ON public.clinic_services(service_id);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at_clinic_services
BEFORE UPDATE ON public.clinic_services
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- RLS Policies
ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read offered clinic services" ON public.clinic_services
AS PERMISSIVE FOR SELECT
TO public
USING (is_offered = TRUE);

CREATE POLICY "Admins can manage clinic services" ON public.clinic_services
AS PERMISSIVE FOR ALL
TO service_role; -- Or a specific admin role

-- Comments for clarity
COMMENT ON TABLE public.clinic_services IS 'Join table linking clinics to the master services they offer, with optional clinic-specific pricing.';
COMMENT ON COLUMN public.clinic_services.clinic_specific_price IS 'Optional: Price for this service at this specific clinic. If NULL, refer to a standard price or indicate POA.';
COMMENT ON COLUMN public.clinic_services.is_offered IS 'Indicates if the clinic currently offers this service.'; 