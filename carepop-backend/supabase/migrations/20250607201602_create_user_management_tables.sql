-- Create the appointment_reports table
CREATE TABLE public.appointment_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    created_by_admin_id UUID NOT NULL REFERENCES auth.users(id),
    report_content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add a trigger to update 'updated_at' timestamp on any change
CREATE TRIGGER set_appointment_reports_updated_at
BEFORE UPDATE ON public.appointment_reports
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

-- RLS policy for appointment_reports: only admins can manage
ALTER TABLE public.appointment_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access on appointment_reports"
ON public.appointment_reports
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);


-- Create the user_medical_records table
CREATE TABLE public.user_medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_by_admin_id UUID NOT NULL REFERENCES auth.users(id),
    record_title TEXT NOT NULL,
    record_details TEXT,
    record_file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add a trigger to update 'updated_at' timestamp on any change
CREATE TRIGGER set_user_medical_records_updated_at
BEFORE UPDATE ON public.user_medical_records
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

-- RLS policy for user_medical_records: only admins can manage
ALTER TABLE public.user_medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access on user_medical_records"
ON public.user_medical_records
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);
