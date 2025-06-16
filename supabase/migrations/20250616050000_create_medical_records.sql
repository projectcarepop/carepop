-- Create the medical_records table
CREATE TABLE public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    
    record_type TEXT NOT NULL,
    description TEXT,
    storage_object_path TEXT NOT NULL, -- Path to the file in Supabase Storage

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_medical_records_user_id ON public.medical_records(user_id);
CREATE INDEX idx_medical_records_appointment_id ON public.medical_records(appointment_id);


-- Enable Row Level Security
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- 1. Users can view their own medical records.
CREATE POLICY "Users can view their own medical records"
ON public.medical_records
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Providers can view records associated with their appointments.
CREATE POLICY "Providers can view records for their appointments"
ON public.medical_records
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT record.id
        FROM public.medical_records AS record
        JOIN public.appointments AS appt ON record.appointment_id = appt.id
        WHERE appt.provider_id = (
            SELECT provider_id FROM public.providers WHERE user_id = auth.uid()
        )
    )
);

-- 3. Admins have full access.
CREATE POLICY "Admins can manage all medical records"
ON public.medical_records
FOR ALL
TO authenticated
USING (
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
);


-- Create a private storage bucket for medical records
-- Note: Bucket creation must often be done via Supabase UI or management API,
-- but we define the policy here for clarity.
-- The bucket itself should be created manually with public access DISABLED.

-- Policies for storage.objects
-- 1. Users can view files linked to their own medical records.
CREATE POLICY "Users can view their own record files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'medical_records' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Admins/Providers can upload files to user folders.
CREATE POLICY "Admins and Providers can upload record files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'medical_records' AND
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('admin', 'provider')
); 