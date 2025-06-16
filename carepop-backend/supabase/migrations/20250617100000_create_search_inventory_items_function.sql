-- Function to search inventory items with joins and filtering
CREATE OR REPLACE FUNCTION search_inventory_items(
    search_term TEXT,
    p_clinic_id UUID,
    p_category_id UUID,
    p_supplier_id UUID,
    p_stock_level_threshold INT
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
    category_id UUID,
    supplier_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    category_name TEXT,
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
        i.category_id,
        i.supplier_id,
        i.created_at,
        i.updated_at,
        ic.name AS category_name,
        s.name AS supplier_name,
        c.name AS clinic_name
    FROM
        public.inventory_items i
    LEFT JOIN public.inventory_categories ic ON i.category_id = ic.id
    LEFT JOIN public.suppliers s ON i.supplier_id = s.id
    LEFT JOIN public.clinics c on i.clinic_id = c.id
    WHERE
        (p_clinic_id IS NULL OR i.clinic_id = p_clinic_id) AND
        (p_category_id IS NULL OR i.category_id = p_category_id) AND
        (p_supplier_id IS NULL OR i.supplier_id = p_supplier_id) AND
        (p_stock_level_threshold IS NULL OR i.stock_quantity <= p_stock_level_threshold) AND
        (
            search_term IS NULL OR
            search_term = '' OR
            i.name ILIKE '%' || search_term || '%' OR
            i.description ILIKE '%' || search_term || '%' OR
            i.sku ILIKE '%' || search_term || '%' OR
            ic.name ILIKE '%' || search_term || '%'
        );
END;
$$ LANGUAGE plpgsql; 