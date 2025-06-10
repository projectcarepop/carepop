-- Create an index on the status column of the appointments table for faster searching.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_status ON public.appointments (status); 