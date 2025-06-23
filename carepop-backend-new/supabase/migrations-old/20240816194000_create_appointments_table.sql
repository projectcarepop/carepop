-- Migration to create the appointments table with RLS policies.

CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys linking to other tables
    -- ON DELETE SET NULL means if a referenced profile/provider/etc is deleted,
    -- the appointment record is kept but the link is severed. This preserves history.
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,

    -- Appointment Status
    status TEXT NOT NULL 
        CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    
    -- Date and Time
    appointment_start_time TIMESTAMPTZ NOT NULL,
    appointment_end_time TIMESTAMPTZ NOT NULL,
    
    -- Additional Info
    cancellation_reason TEXT,
    notes TEXT, -- Notes by the user or provider

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.appointments IS 'Stores all appointment scheduling information.';
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointments:

-- SELECT policies (who can see what)
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Providers can view their appointments" ON public.appointments FOR SELECT
USING (auth.uid() = provider_id);

-- INSERT policy (who can create)
CREATE POLICY "Users can create their own appointments" ON public.appointments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy with the 24-hour rule
CREATE POLICY "Users can update own appointments (24h notice)" ON public.appointments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
    -- This check ensures the appointment is more than 24 hours in the future.
    appointment_start_time > (now() + interval '24 hours')
);

-- Admin management policy (overrides user restrictions)
CREATE POLICY "Admins can manage all appointments" ON public.appointments FOR ALL
USING (public.is_admin(auth.uid())); 