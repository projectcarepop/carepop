-- Supabase SQL Migration: Create trigger_set_updated_at function

BEGIN;

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Example of how to apply it to a table (DO NOT UNCOMMENT - this is for illustration)
-- CREATE TRIGGER set_your_table_updated_at
-- BEFORE UPDATE ON public.your_table_name
-- FOR EACH ROW
-- EXECUTE FUNCTION public.trigger_set_updated_at();

COMMIT; 