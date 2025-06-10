-- Create an index on the name column of the suppliers table for faster searching.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_name ON public.suppliers (name); 