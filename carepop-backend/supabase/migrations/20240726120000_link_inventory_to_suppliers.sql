-- Add a foreign key constraint from inventory_items.supplier_id to suppliers.id

-- First, ensure the constraint doesn't already exist to make the script idempotent.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inventory_items_supplier_id_fkey'
  ) THEN
    ALTER TABLE public.inventory_items
    ADD CONSTRAINT inventory_items_supplier_id_fkey
    FOREIGN KEY (supplier_id)
    REFERENCES public.suppliers(id)
    ON DELETE SET NULL; -- Or ON DELETE RESTRICT if a supplier cannot be deleted if they have inventory items

    RAISE NOTICE 'Foreign key inventory_items_supplier_id_fkey created.';
  ELSE
    RAISE NOTICE 'Foreign key inventory_items_supplier_id_fkey already exists.';
  END IF;
END;
$$; 