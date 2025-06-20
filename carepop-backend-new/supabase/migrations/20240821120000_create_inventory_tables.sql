-- Create the suppliers table to store vendor information
-- Based on the Zod schema in carepop-web/src/app/admin/inventory/components/supplier-form.tsx
CREATE TABLE IF NOT EXISTS public.suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.suppliers IS 'Stores information about suppliers or vendors for inventory items.';

-- Create the inventory_items table for master product list
-- Based on the Zod schema in carepop-web/src/app/admin/inventory/components/inventory-item-form.tsx
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
    unit_of_measurement TEXT, -- e.g., 'box', 'piece', 'bottle'
    reorder_level INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_item_name UNIQUE (name)
);
COMMENT ON TABLE public.inventory_items IS 'Master list of all inventory items, such as medicines or supplies.';
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier_id ON public.inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items(category);

-- Create the inventory_item_batches table to track stock
-- Based on the component logic in carepop-web/src/app/admin/inventory/batches/components/inventory-batch-form.tsx
CREATE TABLE IF NOT EXISTS public.inventory_item_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    batch_number TEXT,
    quantity_received INTEGER NOT NULL,
    current_quantity INTEGER NOT NULL,
    unit_cost NUMERIC(10, 2),
    manufacturing_date DATE,
    expiration_date DATE,
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.inventory_item_batches IS 'Tracks specific batches of inventory items, including stock levels and expiration dates.';
CREATE INDEX IF NOT EXISTS idx_inventory_item_batches_item_id ON public.inventory_item_batches(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_batches_expiration_date ON public.inventory_item_batches(expiration_date);

-- RLS Policies for Suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to admin users on suppliers" ON public.suppliers
FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for Inventory Items
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to admin users on inventory items" ON public.inventory_items
FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for Inventory Item Batches
ALTER TABLE public.inventory_item_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to admin users on item batches" ON public.inventory_item_batches
FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid())); 