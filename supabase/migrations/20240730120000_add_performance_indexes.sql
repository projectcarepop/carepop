-- Create indexes for frequently searched or sorted columns to improve query performance.

-- Index for service name
CREATE INDEX IF NOT EXISTS idx_services_name ON public.services USING btree (name);

-- Index for service category name
CREATE INDEX IF NOT EXISTS idx_service_categories_name ON public.service_categories USING btree (name);

-- Index for inventory item name and SKU
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON public.inventory_items USING btree (item_name);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON public.inventory_items USING btree (sku);

-- Index for supplier name and contact email
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers USING btree (name);
CREATE INDEX IF NOT EXISTS idx_suppliers_contact_email ON public.suppliers USING btree (contact_email);

-- Index for clinic name and locality
CREATE INDEX IF NOT EXISTS idx_clinics_name ON public.clinics USING btree (name);
CREATE INDEX IF NOT EXISTS idx_clinics_locality ON public.clinics USING btree (locality);

-- Note: Indexes on user data in auth.users (e.g., for searching by name) would require
-- a GIN index on the raw_user_meta_data JSONB column, which can be added later if performance on user search becomes an issue.
-- Supabase automatically indexes foreign key columns. 