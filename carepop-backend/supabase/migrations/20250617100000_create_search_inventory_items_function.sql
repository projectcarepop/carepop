-- Drop existing functions to avoid ambiguity
DROP FUNCTION IF EXISTS public.search_inventory_items(TEXT, UUID, UUID, INT);
DROP FUNCTION IF EXISTS public.search_inventory_items(TEXT, UUID, INT);
DROP FUNCTION IF EXISTS public.search_inventory_items(TEXT, UUID, UUID);

-- Function to search inventory items with joins and filtering
CREATE OR REPLACE FUNCTION search_inventory_items(
    search_term TEXT DEFAULT NULL,
    p_supplier_id UUID DEFAULT NULL,
    p_stock_level_threshold INT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    item_name TEXT,
    generic_name TEXT,
    brand_name TEXT,
    sku TEXT,
    quantity_on_hand INT,
    reorder_level INT,
    purchase_cost NUMERIC,
    category TEXT,
    supplier_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    supplier_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.item_name,
        i.generic_name,
        i.brand_name,
        i.sku,
        i.quantity_on_hand,
        i.reorder_level,
        i.purchase_cost,
        i.category,
        i.supplier_id,
        i.created_at,
        i.updated_at,
        s.name AS supplier_name
    FROM
        public.inventory_items i
    LEFT JOIN public.suppliers s ON i.supplier_id = s.id
    WHERE
        (p_supplier_id IS NULL OR i.supplier_id = p_supplier_id) AND
        (p_stock_level_threshold IS NULL OR i.quantity_on_hand <= p_stock_level_threshold) AND
        (
            search_term IS NULL OR
            search_term = '' OR
            i.item_name ILIKE '%' || search_term || '%' OR
            i.generic_name ILIKE '%' || search_term || '%' OR
            i.brand_name ILIKE '%' || search_term || '%' OR
            i.sku ILIKE '%' || search_term || '%' OR
            i.category ILIKE '%' || search_term || '%'
        );
END;
$$ LANGUAGE plpgsql; 