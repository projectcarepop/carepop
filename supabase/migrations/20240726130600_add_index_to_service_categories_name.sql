-- Create an index on the name column of the service_categories table for faster searching.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_categories_name ON public.service_categories (name); 