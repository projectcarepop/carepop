-- Create an index on the name column of the services table for faster searching.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_name ON public.services (name); 