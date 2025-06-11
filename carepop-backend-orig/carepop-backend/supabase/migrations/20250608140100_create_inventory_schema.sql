-- Create the suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the inventory_items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    generic_name TEXT,
    brand_name TEXT,
    category TEXT,
    drug_classification TEXT, -- e.g., OTC, RX, Controlled
    form TEXT, -- e.g., Tablet, Syrup
    strength_dosage TEXT,
    packaging TEXT,
    sku TEXT UNIQUE,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 0,
    purchase_cost NUMERIC(10, 2),
    selling_price NUMERIC(10, 2),
    fda_registration_number TEXT,
    prescription_requirement TEXT,
    controlled_substance_code TEXT,
    storage_requirements TEXT,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the inventory_item_batches table for lot/batch tracking
CREATE TABLE IF NOT EXISTS public.inventory_item_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    expiration_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(item_id, batch_number)
);

-- Create the stock_logs table to track all inventory movements
CREATE TABLE IF NOT EXISTS public.stock_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.inventory_item_batches(id) ON DELETE SET NULL,
    change_quantity INTEGER NOT NULL,
    transaction_type TEXT NOT NULL, -- e.g., stock-in, dispense, adjustment-damage, adjustment-expired
    user_id UUID REFERENCES auth.users(id),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_item_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access on suppliers" ON public.suppliers;
CREATE POLICY "Allow admin full access on suppliers" ON public.suppliers FOR ALL TO authenticated WITH CHECK ( (get_my_role() = 'admin'::text) );

DROP POLICY IF EXISTS "Allow admin full access on inventory_items" ON public.inventory_items;
CREATE POLICY "Allow admin full access on inventory_items" ON public.inventory_items FOR ALL TO authenticated WITH CHECK ( (get_my_role() = 'admin'::text) );

DROP POLICY IF EXISTS "Allow admin full access on inventory_item_batches" ON public.inventory_item_batches;
CREATE POLICY "Allow admin full access on inventory_item_batches" ON public.inventory_item_batches FOR ALL TO authenticated WITH CHECK ( (get_my_role() = 'admin'::text) );

DROP POLICY IF EXISTS "Allow admin full access on stock_logs" ON public.stock_logs;
CREATE POLICY "Allow admin full access on stock_logs" ON public.stock_logs FOR ALL TO authenticated WITH CHECK ( (get_my_role() = 'admin'::text) ); 