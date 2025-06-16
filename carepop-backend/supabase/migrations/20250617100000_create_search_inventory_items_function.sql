-- Function to search inventory items with joins and filtering
CREATE OR REPLACE FUNCTION search_inventory_items(
    search_term TEXT DEFAULT NULL,
    p_clinic_id UUID DEFAULT NULL,
    p_supplier_id UUID DEFAULT NULL,
    p_stock_level_threshold INT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    sku TEXT,
    stock_quantity INT,
    reorder_level INT,
    cost_per_unit NUMERIC,
    clinic_id UUID,
    category_name TEXT,
    supplier_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    supplier_name TEXT,
    clinic_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.name,
        i.description,
        i.sku,
        i.stock_quantity,
        i.reorder_level,
        i.cost_per_unit,
        i.clinic_id,
        i.category AS category_name,
        i.supplier_id,
        i.created_at,
        i.updated_at,
        s.name AS supplier_name,
        c.name AS clinic_name
    FROM
        public.inventory_items i
    LEFT JOIN public.suppliers s ON i.supplier_id = s.id
    LEFT JOIN public.clinics c on i.clinic_id = c.id
    WHERE
        (p_clinic_id IS NULL OR i.clinic_id = p_clinic_id) AND
        (p_supplier_id IS NULL OR i.supplier_id = p_supplier_id) AND
        (p_stock_level_threshold IS NULL OR i.stock_quantity <= p_stock_level_threshold) AND
        (
            search_term IS NULL OR
            search_term = '' OR
            i.name ILIKE '%' || search_term || '%' OR
            i.description ILIKE '%' || search_term || '%' OR
            i.sku ILIKE '%' || search_term || '%' OR
            i.category ILIKE '%' || search_term || '%'
        );
END;
$$ LANGUAGE plpgsql; 