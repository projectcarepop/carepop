-- APPT-RLS-6: RLS Policies for provider_availability Table

-- Ensure RLS is enabled on the table (uncomment if this is the first RLS setup for this table)
-- ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;

-- Policies for Providers

CREATE POLICY provider_select_own_availability
ON public.provider_availability
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.providers prov
    JOIN public.user_roles ur ON prov.user_id = ur.user_id
    WHERE prov.user_id = auth.uid()
      AND ur.role = 'provider'
      AND prov.id = provider_availability.provider_id
  )
);

CREATE POLICY provider_insert_own_availability
ON public.provider_availability
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.providers prov
    JOIN public.user_roles ur ON prov.user_id = ur.user_id
    WHERE prov.user_id = auth.uid()
      AND ur.role = 'provider'
      AND prov.id = provider_availability.provider_id
  )
);

CREATE POLICY provider_update_own_availability
ON public.provider_availability
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.providers prov
    JOIN public.user_roles ur ON prov.user_id = ur.user_id
    WHERE prov.user_id = auth.uid()
      AND ur.role = 'provider'
      AND prov.id = provider_availability.provider_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.providers prov
    JOIN public.user_roles ur ON prov.user_id = ur.user_id
    WHERE prov.user_id = auth.uid()
      AND ur.role = 'provider'
      AND prov.id = provider_availability.provider_id
  )
);

CREATE POLICY provider_delete_own_availability
ON public.provider_availability
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.providers prov
    JOIN public.user_roles ur ON prov.user_id = ur.user_id
    WHERE prov.user_id = auth.uid()
      AND ur.role = 'provider'
      AND prov.id = provider_availability.provider_id
  )
);

-- Policies for Admins

CREATE POLICY admin_select_all_availability
ON public.provider_availability
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY admin_insert_any_availability
ON public.provider_availability
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY admin_update_any_availability
ON public.provider_availability
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY admin_delete_any_availability
ON public.provider_availability
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

-- Policy for Authenticated Users (e.g., Patients) to SELECT active/visible slots

CREATE POLICY authenticated_user_select_active_availability
ON public.provider_availability
FOR SELECT
TO authenticated
USING (
  provider_availability.is_active = TRUE -- Assumes an 'is_active' boolean column. Adjust if your column name or logic for visibility is different.
);

-- Note:
-- 1. Ensure RLS is enabled on the public.provider_availability table (uncomment ALTER TABLE line if needed).
-- 2. Assumes the authenticated role has USAGE grant on the public schema.
-- 3. Assumes existence of public.providers (id, user_id), public.user_roles (user_id, role) tables,
--    and a public.provider_availability table with at least provider_id and is_active columns. 