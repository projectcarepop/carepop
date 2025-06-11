-- Ensure the uuid-ossp extension exists if not already handled by other migrations
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure the updated_at function exists (idempotent)
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Define an ENUM type for appointment statuses if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status_enum') THEN
        CREATE TYPE public.appointment_status_enum AS ENUM (
            'pending_confirmation',
            'confirmed',
            'cancelled_by_user',
            'cancelled_by_clinic',
            'completed',
            'no_show'
        );
    END IF;
END$$;

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL, -- Or ON DELETE RESTRICT
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,     -- Or ON DELETE RESTRICT
    provider_id UUID, -- FK to a future providers table can be added later
    appointment_datetime TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status public.appointment_status_enum NOT NULL DEFAULT 'pending_confirmation',
    notes_user TEXT,
    notes_clinic TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for foreign keys and commonly queried columns
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_service_id ON public.appointments(service_id);
CREATE INDEX idx_appointments_clinic_id ON public.appointments(clinic_id);
CREATE INDEX idx_appointments_provider_id ON public.appointments(provider_id);
CREATE INDEX idx_appointments_appointment_datetime ON public.appointments(appointment_datetime);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at_appointments
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- RLS Policies
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own appointments" ON public.appointments
AS PERMISSIVE FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Placeholder for admin/clinic/provider access - TO BE REFINED
CREATE POLICY "Admins/Service role can manage all appointments" ON public.appointments
AS PERMISSIVE FOR ALL
TO service_role; -- This needs to be more granular in a real scenario

-- Comments for clarity
COMMENT ON TABLE public.appointments IS 'Stores appointment bookings made by users for specific services at clinics.';
COMMENT ON COLUMN public.appointments.user_id IS 'The user who booked the appointment.';
COMMENT ON COLUMN public.appointments.service_id IS 'The service that was booked.';
COMMENT ON COLUMN public.appointments.clinic_id IS 'The clinic where the service is booked.';
COMMENT ON COLUMN public.appointments.provider_id IS 'The specific healthcare provider assigned, if any.';
COMMENT ON COLUMN public.appointments.appointment_datetime IS 'The scheduled date and time of the appointment.';
COMMENT ON COLUMN public.appointments.duration_minutes IS 'The expected duration of the appointment in minutes.';
COMMENT ON COLUMN public.appointments.status IS 'The current status of the appointment.';
COMMENT ON COLUMN public.appointments.notes_user IS 'Any notes provided by the user during booking.';
COMMENT ON COLUMN public.appointments.notes_clinic IS 'Internal notes from the clinic or provider about the appointment.'; 