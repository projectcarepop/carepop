-- Add RLS policies to allow authenticated users to read inventory and supplier data.

-- Allow authenticated users to read from the suppliers table
CREATE POLICY "Allow authenticated users to read suppliers"
ON public.suppliers
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to read from the inventory_items table
CREATE POLICY "Allow authenticated users to read inventory_items"
ON public.inventory_items
FOR SELECT
TO authenticated
USING (true); 