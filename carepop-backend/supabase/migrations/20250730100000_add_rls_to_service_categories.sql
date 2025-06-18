BEGIN;

-- Enable RLS on the service_categories table if it's not already.
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Allow admin users to read all service categories.
CREATE POLICY "Allow admin read access to service categories"
ON public.service_categories
FOR SELECT
USING (public.is_admin(auth.uid()));

COMMIT; 