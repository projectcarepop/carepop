-- Create an index on the name column of the clinics table for faster searching.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clinics_name ON public.clinics (name); 