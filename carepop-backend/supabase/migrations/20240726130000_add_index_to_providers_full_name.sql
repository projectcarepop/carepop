-- Create an index on the full_name column of the providers table for faster searching.

-- Using CONCURRENTLY allows the index to be built without locking the table,
-- which is essential for production environments.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_providers_full_name ON public.providers (full_name); 