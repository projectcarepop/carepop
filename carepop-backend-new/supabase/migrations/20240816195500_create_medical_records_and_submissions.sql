-- Migration to create the medical records and form submissions tables.

-- 1. Medical Records Table (Container)
-- Acts as a container for all clinical data related to a single appointment.
CREATE TABLE public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.medical_records IS 'A container for all clinical forms for a single appointment.';
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Medical Records (Strict)
CREATE POLICY "Patients can view their own medical records" ON public.medical_records FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Providers can view records for their appointments" ON public.medical_records FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Providers can create records for their appointments" ON public.medical_records FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Admins have full access to medical records" ON public.medical_records FOR ALL USING (public.is_admin(auth.uid()));


-- 2. Form Submissions Table
-- Stores the actual data filled into a form for a specific medical record.
CREATE TABLE public.form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
    form_template_id UUID NOT NULL REFERENCES public.form_templates(id) ON DELETE RESTRICT,
    
    -- The actual answers, stored as a JSON object.
    -- This data MUST be encrypted at the application level before being stored.
    submission_data JSONB NOT NULL,

    -- The path to a file in Supabase Storage, e.g., 'patient-files/record-id/lab_result.pdf'
    supplemental_file_path TEXT,
    
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.form_submissions IS 'Stores filled-out, encrypted form data and file attachments for a medical record.';
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Form Submissions (Strict)
-- These policies check against the parent medical_record.
CREATE POLICY "Users can access submissions for records they can access" ON public.form_submissions FOR ALL
USING (
  (
    SELECT TRUE
    FROM public.medical_records mr
    WHERE mr.id = medical_record_id
    -- The RLS policies on medical_records will be implicitly checked here.
  )
); 