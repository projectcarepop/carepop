-- APPT-RLS-5: Limited updates for Patients/Providers

-- Policy 1: Patients can update the status of their own appointments to 'cancelled_by_user'
CREATE POLICY patient_can_cancel_own_appointment
ON public.appointments
FOR UPDATE
TO authenticated
USING (
    -- Row can be targeted if:
    auth.uid() = user_id AND -- It's their own appointment
    -- AND appointments.status NOT IN ('cancelled_by_user', 'cancelled_by_clinic', 'completed') -- Optional: uncomment/adjust if not cancellable from certain states
    appointment_datetime > (now() + interval '1 hour') -- Example: Can only cancel if more than 1 hour away. ADJUST INTERVAL PER BUSINESS RULES.
)
WITH CHECK (
    -- Row, after update, must satisfy:
    auth.uid() = user_id AND -- Still their own appointment
    status = 'cancelled_by_user' -- The new status must be 'cancelled_by_user'
);

-- Policy 2: Providers can update status of their assigned appointments (e.g., to 'completed', 'no_show')
CREATE POLICY provider_can_update_assigned_appointment_status
ON public.appointments
FOR UPDATE
TO authenticated
USING ( -- Row can be targeted if:
  EXISTS (
    SELECT 1
    FROM public.providers prov
    JOIN public.user_roles ur ON prov.user_id = ur.user_id
    WHERE prov.user_id = auth.uid()
      AND ur.role = 'provider'
      AND prov.id = appointments.provider_id -- It's an appointment assigned to this provider
  )
  -- AND appointments.status NOT IN ('cancelled_by_user', 'cancelled_by_clinic') -- Optional: uncomment/adjust if provider cannot update already cancelled appointments
  -- AND appointment_datetime <= now() -- Example: Provider can only update for current/past appointments. ADJUST PER BUSINESS RULES.
)
WITH CHECK ( -- Row, after update, must satisfy:
  EXISTS (
    SELECT 1
    FROM public.providers prov
    JOIN public.user_roles ur ON prov.user_id = ur.user_id
    WHERE prov.user_id = auth.uid()
      AND ur.role = 'provider'
      AND prov.id = appointments.provider_id -- Still one of their assigned appointments
  ) AND
  status IN ('confirmed', 'completed', 'no_show') -- Allowed target statuses by provider. ADJUST PER BUSINESS RULES.
);

-- Note:
-- 1. Assumes RLS is already enabled on the public.appointments table.
-- 2. Assumes the authenticated role has USAGE grant on the public schema.
-- 3. Assumes existence of public.providers (id, user_id) and public.user_roles (user_id, role) tables.
-- 4. Column-specific update restrictions (e.g., only allowing 'status' to be changed) must be enforced by the application/API layer constructing the SQL.
-- 5. Business logic conditions (e.g., time before appointment for cancellation) are examples and MUST BE REVIEWED AND ADJUSTED. 